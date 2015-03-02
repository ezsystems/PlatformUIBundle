 Feature: See binaryfield filled on content creation

    @javascript
    Scenario: As an editor, I want to to add a binaryfile
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Create a content"
        And I checked "Media" checkbox
        And I click on the content type "File"
        And I fill in "Name*" with "Binary file"
        When I upload a file "File1.txt"
        And I click on the side menu option "Publish"
        Then I should see "Binary file" title
        And I should see element "File" with file "File1.txt"

    @javascript
    Scenario: As an editor, I want to be able to fill the BinaryFile fields when editing Content
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on "Media library" link
        And I click on the side menu option "Content tree"
        And I click on "Binary file" link
        When I click on the side menu option "Edit"
        Then I should see "File name: File1.txt" text
        And I should see "Type: text/plain" text
