Feature: PlatformUI Content

@javascript
    Scenario: As an editor I want to edit content after creating it
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Folder"
        And I filled form with:
            | field      | value |
            | Name*      | Test  |
            | Short name | Te    |
        And I click on the side menu option "Publish"
        When I click on the side menu option "Edit"
        Then I see field with value:
            | field      | value |
            | Name*      | Test  |
            | Short name | Te    |

   @javascript
    Scenario: As an editor, I want to be able to create content by picking a content type
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Gallery"
        And I filled form with:
            | field             | value   |
            | Name*             | Galeria |
            | Short description | Gal     |
            | Description       | Galulas |
            | Tags              | tag1    |
        And I click on the side menu option "Publish"
        When I click on the side menu option "Edit"
        Then I see field with value:
            | field             | value   |
            | Name*             | Galeria |
            | Short description | Gal     |
            | Description       | Galulas |
            | Tags              | tag1    |

    @javascript
    Scenario: As an editor, I want to be able to create content by picking a content type
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Blog"
        And I filled form with:
            | field       | value |
            | Name        | Blogo |
            | Description | Blo   |
            | Tags        | tag1  |
        And I click on the side menu option "Publish"
        When I click on the side menu option "Edit"
        Then I see field with value:
            | field       | value |
            | Name        | Blogo |
            | Description | Blo   |
            | Tags        | tag1  |
