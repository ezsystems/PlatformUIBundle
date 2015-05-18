Feature: Test the validations done on fields from PlatformUI - URL fieldtype
    In order to validate the URL fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with URL fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has an URL fieldtype must have an URL and a Text fields
        Given a Content Type with an "URL" Field exists
        When I create a content of this type
        Then I should see an "URL" field
        And I should see a "Text" field

    @javascript
    Scenario: The label of an mandatory URL field of a Content must be marked as mandatory
        Given a Content Type with a "required" "URL" with "Name" "Site" exists
        When I create a content of this type
        Then the "Site" field should be marked as mandatory

    @javascript
    Scenario: When editing a Content the label of an URL field must have the same name than field type from the respective Content Type
        Given a Content Type with an "URL" with "Name" "Site" exists
        When I create a content of this type
        Then I should see a "Site:" label related with the "url" and "text" fields
        And I should see a "URL:" label related with the "url" field
        And I should see an "Text:" label related with the "text" field

    ##
    # Creating Content using a Content Type that has an URL Fieldtype
    ##
    @javascript
    Scenario: Publishing a valid URL Field works when using one URL
        Given a Content Type with an "URL" Field exists
        When I create a content of this type
        And I set "eZ Site - http://www.ez.no" as the Field value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an URL Field fails validation when using an invalid text
        Given a Content Type with an "URL" Field exists
        When I create a content of this type
        And I set "eZ Site - ez no" as the Field value
        And I publish the content
        Then the Content is not published
        And I see a "Please enter a valid URL" before the "URL" Field Value

    @javascript
    Scenario: Publishing a required URL Field fails validation when using an empty URL
        Given a Content Type with a "required" "URL" exists
        When I create a content of this type
        And I set an empty value as the Field Value of the "url"
        And I set an empty value as the Field Value of the "text"
        And I publish the content
        Then the Content is not published
        And I see a "This field is required" before the "url" Field Value
        And I see a "This field is required" before the "text" Field Value

    ##
    # Update Content using a Content Type that has an URL Fieldtype
    ##
    @javascript
    Scenario: Updating an URL Field works
        Given a Content Type with an "URL" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "eZ Site - http://www.ez.no" as the Field value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an URL Field fails validation when using an invalid url
        Given a Content Type with an "URL" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "eZ Site - ez no" as the Field value
        And I publish the content
        Then the Content is not published
        And I see a "Please enter a valid URL" before the "URL" Field Value

    @javascript
    Scenario: Publishing a required URL Field fails validation when using an empty URL
        Given a Content Type with a "required" "URL" Field exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value of the "url"
        And I publish the content
        Then the Content is not published
        And I see a "This field is required" before the "url" Field Value

    ##
    # Delete Content using a Content Type that has an URL Fieldtype
    ##
    @javascript
    Scenario: Deleting a content that has an URL field
        Given a Content Type with an "URL" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has an URL fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has an URL should return the expected URL
        Given a Content Type with an "URL" Field exists
        And a Content of this type exists with "url" Field Value set to "http://www.ez.no"
        And a Content of this type exists with "text" Field Value set to "Site eZ"
        When I view this Content
        Then I should see a field with value "Site eZ"
        And I should see the URL "http://www.ez.no" related with "Site eZ" text

    @javascript
    Scenario: Viewing a Content that has an URL fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "URL" Field exists
        And a Content of this type exists with "name" and "text" Fields Values set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
