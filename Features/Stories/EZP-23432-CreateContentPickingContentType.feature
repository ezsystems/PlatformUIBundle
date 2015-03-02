Feature: Create Content from Content Type

   @javascript
    Scenario: As an editor, I want to be able to create content by picking a content type
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Folder"
        And I fill in "Name*" with "Folder1"
        And I click on the side menu option "Publish"
       Then I see Content "Folder1" of type "Folder"

   @javascript
    Scenario: As an editor, I want to be able to create content by picking a content type
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I zone on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Gallery"
        And I fill in "Name*" with "Galeria"
        And I click on the side menu option "Publish"
        Then I see Content "Galeria" of type "Gallery"

    @javascript
    Scenario: As an editor, I want to be able to create content by picking a content type
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Blog"
        And I fill in "Name" with "ModaLisboa"
        And I click on the side menu option "Publish"
        Then I see Content "ModaLisboa" of type "Blog"
