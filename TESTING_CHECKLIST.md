# Testing Checklist - Recorded Lectures Module

## Pre-Testing Setup
- [ ] Ensure MongoDB is running and connected
- [ ] Have at least one course created in the admin panel
- [ ] Clear browser cache and localStorage if needed

## Feature Testing

### 1. Navigation & UI
- [ ] "Recorded Lectures" tab appears in admin panel menu
- [ ] Tab displays Video icon correctly
- [ ] Tab is positioned between "Courses" and "Live Classes"
- [ ] Mobile view shows all tabs in horizontal scroll
- [ ] Tab is clickable and loads the Recorded Lectures section

### 2. Main Page Display
- [ ] Page shows "Recorded Lectures Management" header
- [ ] "Add Lecture" button is visible and clickable
- [ ] All courses are listed with proper names
- [ ] Courses without lectures show "No recorded lectures" message
- [ ] Courses with lectures display a proper table

### 3. Add Lecture Dialog
- [ ] "Add Lecture" button opens the form dialog
- [ ] Form shows all required fields:
  - [ ] Course dropdown (populated with all courses)
  - [ ] Module Title input
  - [ ] Lecture Title input
  - [ ] Video URL input
  - [ ] Duration input
  - [ ] Duration input
  - [ ] Thumbnail upload button
  - [ ] Preview/Free checkbox
  - [ ] Description textarea
- [ ] Dialog closes with X button
- [ ] Cancel button closes without saving

### 4. Add Lecture - Validation
- [ ] Cannot save without Module Title
- [ ] Cannot save without Lecture Title
- [ ] Cannot save without Video URL
- [ ] Cannot save without Course selection
- [ ] Cannot save with invalid URL format (shows error toast)
- [ ] Valid YouTube URL is accepted
- [ ] Valid Vimeo URL is accepted
- [ ] Valid HTTP/HTTPS URL is accepted

### 5. Add Lecture - File Upload
- [ ] Click "Choose File" opens file browser
- [ ] Only image files can be selected (accept="image/*")
- [ ] Selected filename displays in the form
- [ ] Uploading shows "Uploading..." message
- [ ] On success, thumbnail preview image displays
- [ ] Success toast "Thumbnail uploaded successfully!" appears
- [ ] Image is saved to server and URL stored in database

### 6. Add Lecture - Save
- [ ] Click "Add Lecture" button saves the lecture
- [ ] Success toast "Recorded lecture added!" appears
- [ ] Dialog closes automatically
- [ ] New lecture appears in the course's table immediately
- [ ] New lecture is persisted in database

### 7. Recorded Lecture List
- [ ] All lectures display in proper course groupings
- [ ] Table columns display correctly:
  - [ ] Module name
  - [ ] Lecture title (with description preview if available)
  - [ ] Duration
  - [ ] Type badge (Free for preview, Premium for others)
- [ ] Free Preview lectures show blue "Free" badge
- [ ] Premium lectures show gray "Premium" badge
- [ ] Multiple lectures in same module display correctly

### 8. Edit Lecture - Dialog
- [ ] Click "Edit" button opens form with pre-filled data
- [ ] All fields show existing lecture data
- [ ] Course field shows correct course (read from context)
- [ ] Module Name field has existing value
- [ ] Lecture Title field has existing value
- [ ] Video URL field has existing value
- [ ] Duration field has existing value
- [ ] Description shows existing value
- [ ] Preview checkbox shows existing state
- [ ] Thumbnail shows existing image if present

### 9. Edit Lecture - Modify
- [ ] Can modify Module Title
- [ ] Can modify Lecture Title
- [ ] Can modify Video URL
- [ ] Can modify Duration
- [ ] Can modify Description
- [ ] Can toggle Preview checkbox
- [ ] Can upload new thumbnail

### 10. Edit Lecture - Save
- [ ] Click "Update Lecture" button saves changes
- [ ] Success toast "Recorded lecture updated!" appears
- [ ] Dialog closes automatically
- [ ] Updated lecture data displays in table immediately
- [ ] Changes are persisted in database
- [ ] Other lectures remain unchanged

### 11. Delete Lecture
- [ ] Click "Delete" button removes lecture
- [ ] Success toast "Recorded lecture deleted!" appears
- [ ] Lecture disappears from table immediately
- [ ] Lecture is removed from database
- [ ] Other lectures in same course remain
- [ ] Course shows "No recorded lectures" message if all deleted

### 12. View Lecture Video
- [ ] Click "View" button opens video in new tab
- [ ] YouTube links play correctly
- [ ] Vimeo links play correctly
- [ ] Direct video links open correctly

### 13. Database Validation
- [ ] Lecture data is stored in course's recordedLectures array
- [ ] Each lecture has unique ID
- [ ] All required fields are stored
- [ ] Thumbnail URLs are stored correctly
- [ ] Preview boolean is stored correctly
- [ ] Description is stored (if provided)
- [ ] No schema breaking changes

### 14. API Endpoints Testing

#### GET /api/recorded-lectures
- [ ] Returns all lectures from all courses
- [ ] Includes courseId and courseName for each lecture
- [ ] Handles empty database gracefully

#### POST /api/recorded-lectures
- [ ] Creates new lecture in course
- [ ] Requires courseId and lecture object
- [ ] Returns 201 on success
- [ ] Returns 400 on missing fields
- [ ] Returns 404 if course not found

#### PUT /api/recorded-lectures
- [ ] Updates existing lecture
- [ ] Requires courseId, lectureId, and lecture object
- [ ] Returns 200 on success
- [ ] Returns 400 on missing fields
- [ ] Returns 404 if course/lecture not found
- [ ] Updates only specified lecture

#### DELETE /api/recorded-lectures
- [ ] Deletes lecture from course
- [ ] Requires courseId and lectureId
- [ ] Returns 200 on success
- [ ] Returns 400 on missing fields
- [ ] Returns 404 if course/lecture not found
- [ ] Removes only specified lecture

### 15. Error Handling
- [ ] Toast notifications show for errors
- [ ] Network errors display appropriate messages
- [ ] MongoDB errors are handled gracefully
- [ ] File upload failures show error toast
- [ ] Invalid input shows validation error toast

### 16. Edge Cases
- [ ] No courses in system: shows helpful message
- [ ] Course with no lectures: shows "No recorded lectures" message
- [ ] Course with many lectures: table scrolls properly
- [ ] Very long lecture titles: truncate appropriately
- [ ] Very long descriptions: preview shows truncated text
- [ ] Special characters in lecture titles: stored and displayed correctly
- [ ] Large thumbnail images: resize/optimize properly

### 17. Performance
- [ ] Page loads quickly even with many courses
- [ ] Adding lecture doesn't freeze UI
- [ ] File upload shows progress feedback
- [ ] Table scrolling is smooth
- [ ] No memory leaks or excessive re-renders

### 18. Mobile Responsiveness
- [ ] Tab navigation works on mobile
- [ ] Form dialog is readable on small screens
- [ ] Table displays properly on mobile (may stack)
- [ ] Buttons are tappable on touch devices
- [ ] File upload works on mobile browsers

### 19. Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

## Integration Testing
- [ ] Recorded lectures tab doesn't break other admin features
- [ ] Course data remains intact when lectures added
- [ ] Dashboard overview still works
- [ ] Other tabs (Articles, Notes, Classes) unaffected
- [ ] User authentication still works

## Regression Testing
- [ ] Can still add courses
- [ ] Can still edit courses
- [ ] Can still delete courses
- [ ] Can still schedule live classes
- [ ] Can still manage articles and notes
- [ ] Can still manage categories

## Final Verification
- [ ] All CRUD operations working
- [ ] UI is consistent with admin panel design
- [ ] Data is persisted correctly
- [ ] No console errors
- [ ] All toast notifications work
- [ ] File uploads work correctly
