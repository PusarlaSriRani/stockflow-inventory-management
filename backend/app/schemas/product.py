
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from typing import Optional


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None

    quantity_on_hand: int = Field(default=0, ge=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None

    quantity_on_hand: Optional[int] = Field(default=None, ge=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    description: Optional[str]
    quantity_on_hand: int
    cost_price: Optional[Decimal]
    selling_price: Optional[Decimal]
    low_stock_threshold: Optional[int]
    organization_id: int

    model_config = ConfigDict(from_attributes=True)

class StockAdjustment(BaseModel):
    quantity_change: int
    reason: str = Field(min_length=3, max_length=200)


