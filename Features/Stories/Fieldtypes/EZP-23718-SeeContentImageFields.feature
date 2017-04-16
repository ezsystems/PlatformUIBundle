 Feature: See content of an image field

    @javascript
    Scenario: As an editor, I want to to add a binaryfile
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        And I click on the content type "Image"
        And I fill in "Name*" with "Image file"
        And I upload the image "Jellyfish_JPG.jpg"
        When I click on the side menu option "Publish"
        Then I should see "Image file" title
        And I should see element "Image" with image
