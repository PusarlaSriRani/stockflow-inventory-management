
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    organization_id: int

    class Config:
        from_attributes = True
