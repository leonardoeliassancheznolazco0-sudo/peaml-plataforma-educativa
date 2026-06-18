from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, students, assessments, contents, recommendations, ml, dashboard, quiz
from app.api.v1.endpoints import users_management

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(students.router, prefix="/students", tags=["Students"])
router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
router.include_router(contents.router, prefix="/contents", tags=["Contents"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
router.include_router(ml.router, prefix="/ml", tags=["ML"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
router.include_router(users_management.router, prefix="/manage", tags=["Management"])
