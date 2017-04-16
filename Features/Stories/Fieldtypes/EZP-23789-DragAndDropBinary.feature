Feature: Fill an binary field using drag&drop with valid binary types

    @javascript
    Scenario: Drag and drop valid binary files to fill the binary field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        And I click on the content type "File"
        And I fill in "Name*" with "BinaryFile1"
        When I drag and drop a file "File1.txt" to upload
        And I click on the side menu option "Publish"
        Then I should see "BinaryFile1" title
        And I should see element "File" with file "File1.txt"
