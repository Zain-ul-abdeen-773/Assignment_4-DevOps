# Assignment Checklist

Status notes:
- GitHub repo visibility verified as public.
- Testing and staging health endpoints returned `{"status":"ok"}`.
- Visible collaborators currently show only the repository owner, so teammate/instructor invites still need confirmation.
- PR #1 has passing testing and staging PR checks, but it is still open.

## Task 1: Local deployment + repository setup
- [x] Multi-service app with frontend, backend, and database
- [ ] Local demo completed (screenshots still needed for final report)
- [x] Push to public GitHub repo
- [ ] Add teammate as collaborator
- [ ] Add instructor as collaborator
- [x] Protect main branch (no direct commits)

## Task 2: EC2 environments
- [x] Create testing EC2 (Ubuntu Server 24 LTS target)
- [x] Create staging EC2 (Ubuntu Server 24 LTS target)
- [ ] Use one shared security group (confirm in AWS console)
- [x] Install Node.js, Nginx, PostgreSQL, PM2
- [x] Open ports 22 and 80 (SSH deploy and HTTP health checks verified)

## Task 3: CI/CD automation
- [x] PR workflow for testing deploy
- [x] Push workflow for staging deploy
- [x] Manual trigger enabled for both
- [x] Configure GitHub secrets and variables
- [x] Verify testing success email notification
- [ ] Verify failure email notification after final Mailtrap recipient settings
- [x] Validate testing and staging URLs
- [ ] Merge PR #1 to main and confirm staging push workflow completes

## Report artifacts
- [x] Write project intro and objective
- [x] Document challenges
- [x] Include CI/CD flow diagram
- [ ] Add screenshots with captions
