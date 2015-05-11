Feature: Test the validations done on fields from PlatformUI - Authors fieldtype
    In order to validate the authors fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with authors fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has an author fieldtype must have an author and an email fields
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        Then I should have an "name" field
        And I should have an "email" field

    @javascript
    Scenario: A Content of a Content Type that has an author fieldtype must be prefilled with user's name and email
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        Then I should have an "name" field filled with Editor's Username
        And I should have an "email" field filled with Editor's Email

    @javascript
    Scenario: A Content of a Content Type that has an author fieldtype must have a "Remove this author" and a "Add another author" buttons
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        Then I should have an "Remove this author" button
        And I should have an "Add another author" button

    @javascript
    Scenario: When editing a Content the label of an author field must have the same name of the field type from the respective Content Type
        Given a Content Type with an "authors" with "Name" "Participants" exists
        When I create a content of this Content Type
        Then I should have a "Participants:" label related with the "eame" and "email" fields
        And I should have a "Name:" label related with the "name" field
        And I should have an "Email:" label related with the "email" field

    @javascript
    Scenario: When editing a Content with an author field the "Remove this author" button is disabled when exists one author
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        Then all the "Remove this author" buttons are "disabled"

    @javascript
    Scenario: When editing a Content the "Remove this author" button is enabled when exists more than one author
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        And I add two authors
        Then all the "Remove this author" buttons are "enabled"

    @javascript
    Scenario: When editing a Content with an author field with two authors the "Remove this author" button is disabled again when deleting one author
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists with "two" authors
        When I remove the "First" author
        Then all the "Remove this author" buttons are "disabled"

    @javascript
    Scenario: The label of an mandatory author field of a Content must have an * as suffix on the field's label's' name
        Given a Content Type with a "required" "authors" with "Name" "Participants" exists
        When I create a content of this Content Type
        Then I should have a "Participants*:" label related with the "name" and "email" fields

    ##
    # Creating Content using a Content Type that has an Authors Fieldtype
    ##
    @javascript
    Scenario: Publishing a valid authors Field works when using one author
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        And I set "Paul" as the "name" Field Value of the "first" author
        And I set "paul@acme.com" as the "email" Field Value of the "first" author
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid authors Field works when using more than one author
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        And I set "Paul" as the "name" Field Value of the "first" author
        And I set "paul@acme.com" as the "email" Field Value of the "first" author
        And I add another author
        And I set "Ana" as the "name" Field Value of the "second" author
        And I set "ana@acme.com" as the "email" Field Value of the "second" author
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an authors Field fails validation when using an invalid email
        Given a Content Type with an "authors" Field exists
        When I create a content of this Content Type
        And I set "Paul" as the "name" Field Value of the "first" author
        And I set "paul" as the "email" Field Value of the "first" author
        And I publish the content
        Then the Content is not published
        And I see a "!" before the "email" Field Value

    @javascript
    Scenario: Publishing an required authors Field fails validation when using an empty author
        Given a Content Type with a "requited" "authors" exists
        When I create a content of this Content Type
        And I set an empty value as the "name" Field Value of the "first" author
        And I set an empty value as the "email" Field Value of the "first" author
        And I publish the content
        Then Publishing fails
        And I see a "This field is required" before the "name" Field Value
        And I see a "This field is required" before the "email" Field Value

    ##
    # Update Content using a Content Type that has an Authors Fieldtype
    ##
    @javascript
    Scenario: Updating an author Field works
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists
        When I update this content setting "Paul" as the "name" Field Value of the "first" author
        And I update this content setting "paul@acme.com" as the "email" Field Value of the "first" author
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an authors Field fails validation when using an invalid email
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists
        When I set "paul" as the "email" Field Value of the "first" author
        And I publish the content
        Then the Content is not published
        And I see a "!" before the "email" Field Value

    @javascript
    Scenario: Publishing a required authors Field fails validation when using an empty author
        Given a Content Type with a "requited" "authors" Field exists
        And a Content of this Content Type exists
        When I set an empty value as the "name" Field Value of the "first" author
        And I set an empty value as the "email" Field Value of the "first" author
        And I publish the content
        Then the Content is not published
        And I see a "!" before the "name" Field Value
        And I see a "!" before the "email" Field Value

    ##
    # Delete Content using a Content Type that has an Authors Fieldtype
    ##
    @javascript
    Scenario: Deleting a content that has an author field
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists
        When I delete this Content
        Then the Content is successfully deleted

    @javascript
    Scenario: Deleting one author from the authors list
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists with "two" authors
        When I delete the "first" author
        Then the author is successfully deleted

    ##
    # Viewing content that has an Authors fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has an author fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists with "name" and "email" Fields Values set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"

    @javascript
    Scenario: Viewing a Content that has more than one author should return the expected authors
        Given a Content Type with an "authors" Field exists
        And a Content of this Content Type exists with "<name>" and "<email>" Fields Values
            | name | email         |
            | Paul | paul@acme.com |
            | Ana  | ana@acme.com  |
        When I view this Content
        Then I should see a field with value "Paul <paul@acme.com>"
        And I should see a field with value "Ana <ana@acme.com>"
