
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.models.stock_movement import StockMovement

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockAdjustment
)

from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# CREATE PRODUCT
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_product = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.sku == product_data.sku
    ).first()

    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Product SKU already exists"
        )

    new_product = Product(
        **product_data.model_dump(),
        organization_id=current_user.organization_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# GET ALL PRODUCTS
@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).all()

    return products


# GET LOW STOCK PRODUCTS
@router.get("/low-stock", response_model=list[ProductResponse])
def get_low_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.low_stock_threshold.isnot(None),
        Product.quantity_on_hand <= Product.low_stock_threshold
    ).all()

    return products


# INVENTORY DASHBOARD SUMMARY
@router.get("/dashboard/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get products belonging to the logged-in organization
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).all()

    # Total number of products
    total_products = len(products)

    # Total available stock
    total_stock = sum(
        product.quantity_on_hand or 0
        for product in products
    )

    # Count low-stock products
    low_stock_count = sum(
        1
        for product in products
        if product.low_stock_threshold is not None
        and product.quantity_on_hand <= product.low_stock_threshold
    )

    # Calculate total inventory value using cost price
    total_inventory_value = sum(
        product.quantity_on_hand * float(product.cost_price or 0)
        for product in products
    )

    # Return dashboard values
    return {
        "total_products": total_products,
        "total_quantity": total_stock,
        "total_stock": total_stock,
        "low_stock_count": low_stock_count,
        "total_stock_value": round(total_inventory_value, 2),
        "total_inventory_value": round(total_inventory_value, 2)
    }


# GET PRODUCT BY ID
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# UPDATE PRODUCT
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = product_data.model_dump(exclude_unset=True)

    if "sku" in update_data:
        existing_product = db.query(Product).filter(
            Product.organization_id == current_user.organization_id,
            Product.sku == update_data["sku"],
            Product.id != product_id
        ).first()

        if existing_product:
            raise HTTPException(
                status_code=400,
                detail="Product SKU already exists"
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


# DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


# STOCK ADJUSTMENT WITH HISTORY
@router.post(
    "/{product_id}/stock-adjustment",
    response_model=ProductResponse
)
def adjust_stock(
    product_id: int,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    previous_quantity = product.quantity_on_hand
    new_quantity = previous_quantity + adjustment.quantity_change

    if new_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    product.quantity_on_hand = new_quantity

    movement = StockMovement(
        product_id=product.id,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        previous_quantity=previous_quantity,
        quantity_change=adjustment.quantity_change,
        new_quantity=new_quantity,
        reason=adjustment.reason
    )

    db.add(movement)
    db.commit()
    db.refresh(product)

    return product


# GET STOCK MOVEMENT HISTORY
@router.get("/{product_id}/stock-history")
def get_stock_history(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    movements = db.query(StockMovement).filter(
        StockMovement.product_id == product_id,
        StockMovement.organization_id == current_user.organization_id
    ).order_by(
        StockMovement.created_at.desc()
    ).all()

    return movements
