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
        And I upload the file "File1.txt"
        When I click on the side menu option "Publish"
        Then I should see "Binary file" title
        And I should see element "File" with file "File1.txt"

    @javascript
    Scenario: As an editor, I want to be able to fill the BinaryFile fields when editing Content
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Content tree"
        When I click on the content tree with path "Files/eZ Publish 5 Platform Whitepaper"
        Then I should see "eZ Publish 5 Platform Whitepaper" title
        And I should see "20130116_whitepaper_ezpublish5 light.pdf" text
        And I should see "(1077923 bytes)" text
