from fastapi import APIRouter, Depends

from ..controllers import blog as ctrl
from ..dependencies import get_current_user
from ..schemas.blog import CategoryOut, PaginatedPostsOut, PostOut

router = APIRouter(prefix="/api/v1/blog", tags=["blog"])

# ── Public (no auth) ──────────────────────────────────────────────────────────
router.get("/posts", response_model=PaginatedPostsOut)(ctrl.list_posts)
router.get("/posts/slug/{slug}", response_model=PostOut)(ctrl.get_post_by_slug)
router.get("/posts/{post_id}", response_model=PostOut)(ctrl.get_post)
router.get("/categories", response_model=list[CategoryOut])(ctrl.list_categories)

# ── Admin (JWT required) ──────────────────────────────────────────────────────
_auth = [Depends(get_current_user)]

router.post("/posts", response_model=PostOut, status_code=201, dependencies=_auth)(
    ctrl.create_post
)
router.put("/posts/{post_id}", response_model=PostOut, dependencies=_auth)(
    ctrl.update_post
)
router.patch("/posts/{post_id}", response_model=PostOut, dependencies=_auth)(
    ctrl.patch_post
)
router.delete("/posts/{post_id}", status_code=204, dependencies=_auth)(
    ctrl.delete_post
)
router.post("/categories", response_model=CategoryOut, status_code=201, dependencies=_auth)(
    ctrl.create_category
)
