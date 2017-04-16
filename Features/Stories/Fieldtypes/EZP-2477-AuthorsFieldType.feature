Feature: Test the validations done on Author fieldtype from Editorial Interface

    @javascript
    Scenario: Message when using empty author field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Author"
        And I fill in "Name" with "AuthorTest"
        When I click on the side menu option "Publish"
        Then I should see an element "Author" with value "This field is empty"

    @javascript
    Scenario: Fill more than one author 
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Author"
        And I clicked on "Add another author" button  
        And I fill in "Name" with "AuthorTest"
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1@authors.pt  |
            | Author2 | author2@authors.com |
        When I click on the side menu option "Publish"
        Then I should see an element "Author" with value "Author1 <author1@authors.pt> Author2 <author2@authors.com>"

    @javascript
    Scenario: Fill three authors then remove one then publish
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Author"
        And I fill in "Name" with "AuthorTest"
        And I clicked on "Add another author" button
        And I clicked on "Add another author" button
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1@authors.pt  |
            | Author2 | author2@authors.com |
            | Author3 | author3@authors.no  |
        And I click on "Remove this author" button
        When I click on the side menu option "Publish" 
        Then I should see an element "Author" with value "Author2 <author2@authors.com> Author3 <author3@authors.no>"

    @javascript
    Scenario: Fill one author then remove it then publish
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Author"
        And I fill in "Name" with "AuthorTest"
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1@authors.pt  |
        And I clicked on "Add another author" button
        And I click on "Remove this author" button
        When I click on the side menu option "Publish"
        Then I should see an element "Author" with value "This field is empty"

    @javascript
    Scenario: Unable to publish with wrong email format
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Author"
        And I fill in "Name" with "AuthorTest"
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1authors.pt  |
        When I click on the side menu option "Publish"
        Then I should see 'New "Author"' title
