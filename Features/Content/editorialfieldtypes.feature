@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/UrlEditView
    #URL - Create content with valid url
    @ezp-22108 @qa-248
    Scenario Outline: Create content with valid url
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And I am on "field A"
        And on "URL" I fill with <url_value>
        And on "Name" I fill with <name_value>
        When I exit the "field A"
        Then I see no label message with an error

        Examples: 
            | url_value        | name_value |
            | http://www.ez.no | eZ         |
            | www.ez.no        |            |
            |                  | eZ         |
            |                  |            |

    #URL - Create content with invalid url
    @ezp-22108 @qa-248
    Scenario Outline: Create content with invalid url
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And I am on "field A"
        And on "URL" I fill with <url_value>
        And on "Name" I fill with <name_value>
        When I exit the "field A"
        Then I see a label message with an error

        Examples: 
            | url_value   | name_value |
            | ez.no       | eZ         |
            | www ez.no   |            |
            | 123.123.123 | eZ         |

    #URL - check whether the input is filled (if the Field is set required): when the field is required, only the actual URL field is mandatory, the name stays non required
    @ezp-22108 @qa-248
    Scenario Outline: Validate url when exiting the field using valid url
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And "field A" is mandatory
        And I am on "field A"
        And on "URL" I fill with <url_value>
        And on "Name" I fill with <name_value>
        When I exit the "field A"
        Then I see no label message with an error

        Examples: 
            | url_value        | name_value |
            | http://www.ez.no |            |

    #URL - check whether the input is filled (if the Field is set required): when the field is required, only the actual URL field is mandatory, the name stays non required
    @ezp-22108 @qa-248
    Scenario Outline: Validate url when exiting the field using invalid url
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And "field A" is mandatory
        And I am on "field A"
        And on "URL" I fill with <url_value>
        And on "Name" I fill with <name_value>
        When I exit the "field A"
        Then I see a label message with an error

        Examples: 
            | url_value | name_value |
            |           | eZ         |
            |           |            |

    #URL -  A click on the label gives the focus to the input field
    #The label containing the field name and the input "field A"re connected with the id and the for attributes so that a click on the label gives the focus to the URL input field.
    @ezp-22108 @qa-248
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And I have a label "L" with message "M1"
        When I click on label "L"
        Then I goto "field A"

    #URL - When the field is mandatory, a star is added after the URL label for the actual url input field.
    @javascript @ezp-22108 @qa-248
    Scenario: Verify that a star is added after the URL label if the field is mandatory
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        When "field A" is mandatory
        Then I see a "star" after the "URL" label

    #URL - Change the label when the user changes something
    @javascript @ezp-22108 @qa-248
    Scenario: Change the label when the user changes something
        Given I am logged in as "Admin"
        And I have a "field A" of type "URL"
        And I have a label "L" with message "M1"
        When I update the "field A"
        And I see a label "L" with message "M2"
        And message "M2" is different from message "M1"

    #Url - The label (and the description in the tooltip) comes from the field definition in the Content Type.
    @javascript @ezp-22108 @qa-248
    Scenario: The label and the description come from the field definition in the Content Type
        Given I am logged in as "Admin"
        And I have a content type "B" with the following fields:
            | type_field | name_field | description     |
            | url        | url_name   | url_description |
        When I create a content "A" of content type "B"
        Then content "A" has a label "L1"
        And content "A" has a tooltip "T1"
        And the "L1" has the value "url_name"
        And the "T1" has the value "url_description"
