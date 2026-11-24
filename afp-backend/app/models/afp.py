"""Provisional AFP-owned PostgreSQL models."""

from __future__ import annotations

from datetime import date, datetime
from uuid import UUID, uuid4
from typing import Any

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


YES_NO_FIELDS = (
    "paralysis_present",
    "paralysis_flaccid",
    "paralysis_sudden_onset",
    "paralysis_caused_by_injury",
    "paralysis_present_at_birth",
)

YES_NO_UNKNOWN_FIELDS = (
    "fever_when_paralysis_began",
    "muscle_pain_when_paralysis_began",
    "paralysis_asymmetric",
    "paralysis_moved_upward",
    "sensation_present_at_paralysis_site",
    "child_at_health_facility",
)

REFLEX_FIELDS = (
    "right_biceps",
    "left_biceps",
    "right_triceps",
    "left_triceps",
    "right_brachioradialis",
    "left_brachioradialis",
    "right_patellar",
    "left_patellar",
    "right_achilles",
    "left_achilles",
)

MUSCLE_GROUPS = (
    "upper_flex_wrist",
    "upper_extend_wrist",
    "upper_flex_elbow",
    "upper_extend_elbow",
    "upper_flex_shoulder",
    "upper_extend_shoulder",
    "upper_hand_grip",
    "lower_flex_hip",
    "lower_extend_hip",
    "lower_flex_knee",
    "lower_extend_knee",
    "lower_flex_ankle",
    "lower_extend_ankle",
)

MUSCLE_COLUMNS = tuple(
    f"{muscle}_{side}"
    for muscle in MUSCLE_GROUPS
    for side in ("right", "left")
)


class AFPInvestigation(Base):
    """AFP screening and investigation-owned information."""

    __tablename__ = "afp_investigations"

    __table_args__ = (
        *(
            CheckConstraint(
                f"{field} IN ('yes', 'no')",
                name=f"ck_afp_inv_{field}",
            )
            for field in YES_NO_FIELDS
        ),
        *(
            CheckConstraint(
                f"{field} IN ('yes', 'no', 'unknown')",
                name=f"ck_afp_inv_{field}",
            )
            for field in YES_NO_UNKNOWN_FIELDS
        ),
        CheckConstraint(
            "first_contact_category IN ("
            "'Regd doctor','GoB facility','Village doctor',"
            "'NGO Clinic','Homeopath','Kabiraj','Imam',"
            "'Pharmacist','HA','FWA','Other')",
            name="ck_afp_inv_first_contact_category",
        ),
        CheckConstraint(
            "site_of_paralysis <@ ARRAY["
            "'right_arm','left_arm','right_leg','left_leg',"
            "'neck','face','other']::varchar[]",
            name="ck_afp_inv_site_of_paralysis_values",
        ),
        CheckConstraint(
            "frontend_payload IS NULL OR "
            "jsonb_typeof(frontend_payload) = 'object'",
            name="ck_afp_inv_frontend_payload_object",
        ),
        CheckConstraint(
            "frontend_payload IS NULL OR "
            "NOT (frontend_payload ? 'additionalInformation')",
            name="ck_afp_inv_no_ori_section",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    frontend_payload: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Clinical Information
    paralysis_present: Mapped[str | None] = mapped_column(String(3))
    paralysis_flaccid: Mapped[str | None] = mapped_column(String(3))
    paralysis_sudden_onset: Mapped[str | None] = mapped_column(String(3))
    paralysis_onset_date: Mapped[date | None] = mapped_column(Date)
    paralysis_caused_by_injury: Mapped[str | None] = mapped_column(String(3))
    paralysis_present_at_birth: Mapped[str | None] = mapped_column(String(3))
    screening_diagnosis: Mapped[str | None] = mapped_column(String(250))

    # Signs / Symptoms
    fever_when_paralysis_began: Mapped[str | None] = mapped_column(String(7))
    muscle_pain_when_paralysis_began: Mapped[str | None] = mapped_column(
        String(7)
    )

    site_of_paralysis: Mapped[list[str]] = mapped_column(
        ARRAY(String(12)),
        nullable=False,
        default=list,
        server_default=text("'{}'::varchar[]"),
    )

    other_paralysis_site: Mapped[str | None] = mapped_column(String(150))
    paralysis_asymmetric: Mapped[str | None] = mapped_column(String(7))
    paralysis_moved_upward: Mapped[str | None] = mapped_column(String(7))
    sensation_present_at_paralysis_site: Mapped[str | None] = mapped_column(
        String(7)
    )
    child_at_health_facility: Mapped[str | None] = mapped_column(String(7))

    # Facility details: reference source is not yet confirmed.
    selected_facility_option: Mapped[str | None] = mapped_column(Text)
    other_facility_name: Mapped[str | None] = mapped_column(String(200))
    health_facility_notification_date: Mapped[date | None] = mapped_column(
        Date
    )
    medical_record_number: Mapped[str | None] = mapped_column(String(100))

    # AFP-specific DSFP / SIMO notification.
    notified_to_concerned_dsfp_simo: Mapped[bool | None] = mapped_column(
        Boolean
    )
    dsfp_simo_notification_date: Mapped[date | None] = mapped_column(Date)

    # Previous Healthcare Contacts summary
    first_contact_category: Mapped[str | None] = mapped_column(String(20))
    first_contact_category_other: Mapped[str | None] = mapped_column(
        String(150)
    )
    additional_comments: Mapped[str | None] = mapped_column(String(1000))
    suspected_diagnosis: Mapped[str | None] = mapped_column(Text)

    examination: Mapped[AFPClinicalExamination | None] = relationship(
        back_populates="investigation",
        cascade="all, delete-orphan",
        uselist=False,
    )

    contacts: Mapped[list[AFPHealthcareContact]] = relationship(
        back_populates="investigation",
        cascade="all, delete-orphan",
        order_by="AFPHealthcareContact.position",
    )


class AFPClinicalExamination(Base):
    """One examination per AFP investigation."""

    __tablename__ = "afp_clinical_examinations"

    __table_args__ = (
        *(
            CheckConstraint(
                f"{field} IN ('0', '1+', '2+', '3+', '4+')",
                name=f"ck_afp_exam_{field}",
            )
            for field in REFLEX_FIELDS
        ),
        *(
            CheckConstraint(
                f"{field} BETWEEN 0 AND 5",
                name=f"ck_afp_exam_{field}",
            )
            for field in MUSCLE_COLUMNS
        ),
        CheckConstraint(
            "right_plantar_reflex IN ('flexor', 'extensor', 'equivocal')",
            name="ck_afp_exam_right_plantar",
        ),
        CheckConstraint(
            "left_plantar_reflex IN ('flexor', 'extensor', 'equivocal')",
            name="ck_afp_exam_left_plantar",
        ),
    )

    investigation_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("afp_investigations.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Ten bilateral reflex scores (five muscles on each side)
    right_biceps: Mapped[str | None] = mapped_column(String(2))
    left_biceps: Mapped[str | None] = mapped_column(String(2))
    right_triceps: Mapped[str | None] = mapped_column(String(2))
    left_triceps: Mapped[str | None] = mapped_column(String(2))
    right_brachioradialis: Mapped[str | None] = mapped_column(String(2))
    left_brachioradialis: Mapped[str | None] = mapped_column(String(2))
    right_patellar: Mapped[str | None] = mapped_column(String(2))
    left_patellar: Mapped[str | None] = mapped_column(String(2))
    right_achilles: Mapped[str | None] = mapped_column(String(2))
    left_achilles: Mapped[str | None] = mapped_column(String(2))

    # Two plantar reflexes
    right_plantar_reflex: Mapped[str | None] = mapped_column(String(9))
    left_plantar_reflex: Mapped[str | None] = mapped_column(String(9))

    # Upper limb: 14 values
    upper_flex_wrist_right: Mapped[int | None] = mapped_column(SmallInteger)
    upper_flex_wrist_left: Mapped[int | None] = mapped_column(SmallInteger)
    upper_extend_wrist_right: Mapped[int | None] = mapped_column(SmallInteger)
    upper_extend_wrist_left: Mapped[int | None] = mapped_column(SmallInteger)
    upper_flex_elbow_right: Mapped[int | None] = mapped_column(SmallInteger)
    upper_flex_elbow_left: Mapped[int | None] = mapped_column(SmallInteger)
    upper_extend_elbow_right: Mapped[int | None] = mapped_column(SmallInteger)
    upper_extend_elbow_left: Mapped[int | None] = mapped_column(SmallInteger)
    upper_flex_shoulder_right: Mapped[int | None] = mapped_column(
        SmallInteger
    )
    upper_flex_shoulder_left: Mapped[int | None] = mapped_column(
        SmallInteger
    )
    upper_extend_shoulder_right: Mapped[int | None] = mapped_column(
        SmallInteger
    )
    upper_extend_shoulder_left: Mapped[int | None] = mapped_column(
        SmallInteger
    )
    upper_hand_grip_right: Mapped[int | None] = mapped_column(SmallInteger)
    upper_hand_grip_left: Mapped[int | None] = mapped_column(SmallInteger)

    # Lower limb: 12 values
    lower_flex_hip_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_flex_hip_left: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_hip_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_hip_left: Mapped[int | None] = mapped_column(SmallInteger)
    lower_flex_knee_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_flex_knee_left: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_knee_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_knee_left: Mapped[int | None] = mapped_column(SmallInteger)
    lower_flex_ankle_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_flex_ankle_left: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_ankle_right: Mapped[int | None] = mapped_column(SmallInteger)
    lower_extend_ankle_left: Mapped[int | None] = mapped_column(SmallInteger)

    investigation: Mapped[AFPInvestigation] = relationship(
        back_populates="examination",
    )


class AFPHealthcareContact(Base):
    """Repeatable contact, preserving frontend identity and order."""

    __tablename__ = "afp_healthcare_contacts"

    __table_args__ = (
        UniqueConstraint(
            "investigation_id",
            "client_id",
            name="uq_afp_contact_client_id",
        ),
        UniqueConstraint(
            "investigation_id",
            "position",
            name="uq_afp_contact_position",
        ),
        CheckConstraint(
            "position >= 0",
            name="ck_afp_contact_position",
        ),
        CheckConstraint(
            "already_in_network IN ('yes', 'no', 'unknown')",
            name="ck_afp_contact_network",
        ),
        CheckConstraint(
            "reported_case IN ('yes', 'no')",
            name="ck_afp_contact_reported",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    investigation_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("afp_investigations.id", ondelete="CASCADE"),
        nullable=False,
    )

    client_id: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    provider_name: Mapped[str | None] = mapped_column(String(250))
    address: Mapped[str | None] = mapped_column(String(500))
    date_case_visited: Mapped[date | None] = mapped_column(Date)
    already_in_network: Mapped[str | None] = mapped_column(String(7))
    reported_case: Mapped[str | None] = mapped_column(String(3))
    action_taken_planned: Mapped[str | None] = mapped_column(String(500))

    investigation: Mapped[AFPInvestigation] = relationship(
        back_populates="contacts",
    )


class ORIRecord(Base):
    """Independent ORI local record, never linked to an AFP investigation."""

    __tablename__ = "ori_records"
    __table_args__ = (
        CheckConstraint("jsonb_typeof(payload) = 'object'", name="ck_ori_payload_object"),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now(),
    )
