
from sqlalchemy import (
    Column, Integer, String, Text, Numeric,
    DateTime, ForeignKey, UniqueConstraint,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "sku",
            name="uq_product_org_sku"
        ),
        CheckConstraint(
            "quantity_on_hand >= 0",
            name="check_product_quantity"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    quantity_on_hand = Column(Integer, default=0, nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=True)
    selling_price = Column(Numeric(12, 2), nullable=True)
    low_stock_threshold = Column(Integer, nullable=True)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    organization = relationship(
        "Organization",
        back_populates="products"
    )
