Feature: Fill an image field using drag&drop with valid image types

    @javascript
    Scenario: Drag and drop valid image files to fill the image field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        And I click on the content type "Image"
        And I fill in "Name*" with "ImageFile1"
        When I drag and drop a file "Jellyfish_JPG.jpg" to upload
        And I click on the side menu option "Publish"
        Then I should see "ImageFile1" title
        And I should see element "Image" with image
