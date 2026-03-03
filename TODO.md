# Orbit Intel AI - Implementation TODO

## Current Tasks

### 1. Add More Jobs to Dropdown (backend/ai/pipeline.py)
- [x] Understand current profile_map structure
- [ ] Add more job titles (target: 60+ jobs)
- [ ] Jobs will automatically appear in dropdown via /jobs endpoint

### 2. Fix Dropdown Behavior (frontend/src/pages/DashboardPage.tsx)
- [x] Understand current JobSearchDropdown implementation
- [ ] Modify to show dropdown only on click/focus (not when typing)
- [ ] Ensure dropdown closes when clicking outside

### 3. Skip Upload & Analysis Process
- [x] Understand current upload → analyze flow
- [ ] Modify "Analyse Career Path" button to navigate directly to AnalysisPage
- [ ] Store profile context in sessionStorage
- [ ] Modify AnalysisPage to show quick analysis results without actual AI processing
- [ ] Make the process faster by skipping document upload and analysis API calls

## Implementation Notes
- The dropdown pulls from backend /jobs endpoint
- Current jobs: 28 job titles
- Target: 60+ job titles for comprehensive coverage
- Analysis should be instant with pre-computed/mock results when skipping upload

