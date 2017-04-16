Feature: Fill an video field using drag&drop with valid video types

    @javascript
    Scenario: Drag and drop valid video files to fill the video field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        And I click on the content type "Video"
        And I fill in "Name*" with "VideoFile1"
        When I drag and drop a file "Video1.mp4" to upload
        And I click on the side menu option "Publish"
        Then I should see "VideoFile1" title
        And I should see element "File" with file "Video1.mp4"
