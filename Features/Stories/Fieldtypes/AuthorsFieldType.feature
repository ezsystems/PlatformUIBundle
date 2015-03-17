Feature: Test the validations done on Author fieldtype from Editorial Interface - Authors fieldtype

    @javascript
    Scenario: Message when using empty author field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I create a content of content type "Author" with:
            | Name       |
            | AuthorTest |
        And I fill in "Author:" subform with:
            | Name: | Email: |
            |       |        |
        When I click on the actionbar action "Publish"
        Then I should see an element "Author" with value "This field is empty"

    @javascript
    Scenario: Fill more than one author
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I create a content of content type "Author" with:
            | Name       |
            | AuthorTest |
        And I clicked on "Add another author" button
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1@authors.pt  |
            | Author2 | author2@authors.com |
        When I click on the actionbar action "Publish"
        Then I should see an element "Author" with value "Author1 <author1@authors.pt> Author2 <author2@authors.com>"

    @javascript
    Scenario Outline: Fill three authors then remove one then publish
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I create a content of content type "Author" with:
            | Name       |
            | AuthorTest |
        And I clicked on "Add another author" button
        And I clicked on "Add another author" button
        And I fill in "Author:" subform with:
            | Name:   | Email:              |
            | Author1 | author1@authors.pt  |
            | Author2 | author2@authors.com |
            | Author3 | author3@authors.no  |
        And I click on the "Remove this author" button number <index>
        When I click on the actionbar action "Publish"
        Then I should see an element "Author" with value "<value>"

        Examples:
            | index | value                                                      |
            | 1     | Author2 <author2@authors.com> Author3 <author3@authors.no> |
            | 2     | Author1 <author1@authors.pt> Author3 <author3@authors.no>  |
            | 3     | Author1 <author1@authors.pt> Author2 <author2@authors.no>  |

    @javascript
    Scenario: Fill one author then remove it then publish
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I create a content of content type "Author" with:
            | Name       |
            | AuthorTest |
        And I fill in "Author:" subform with:
            | Name:   | Email:             |
            | Author1 | author1@authors.pt |
        And I clicked on "Add another author" button
        And I click on the "Remove this author" button number "1"
        When I click on the actionbar action "Publish"
        Then I should see an element "Author" with value "This field is empty"

    @javascript
    Scenario: Unable to publish with wrong email format
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Author" in Group with identifier "Content" with fields:
            | identifier | Type     | Name   |
            | name       | ezstring | Name   |
            | author     | ezauthor | Author |
        And I create a content of content type "Author" with:
            | Name       |
            | AuthorTest |
        And I fill in "Author:" subform with:
            | Name:   | Email:            |
            | Author1 | author1authors.pt |
        When I click on the actionbar action "Publish"
        Then I should see 'New "Author"' title
