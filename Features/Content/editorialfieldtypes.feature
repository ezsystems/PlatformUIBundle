@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/email
    #email - Validation on exiting the field using a valid email
    #check the input is a valid email (this check is done only when the user leaves the input field)
    #valid when the user input is valid
    #check whether the input is filled (if the field is set required)
    @ezp-21607 @qa-221
    Scenario Outline: Validate email when exiting the field using valid email
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And "field A" is not mandatory
        And I am on "field A"
        And on "field A" I fill with <email>
        When I exit the "field A"
        Then I see no label message with an error

        Examples: 
            | email              |
            | example.test@ez.no |
            |                    |

    #email - Validation on exiting the field using an invalid email
    #check the input is a valid email (this check is done only when the user leaves the input field)
    #error when the user input is not valid
    #check whether the input is filled (if the field is set required)
    @ezp-21607 @qa-221
    Scenario Outline: Validate email when exiting the field using invalid email
        Given I am logged in as "Admin"
        And "field A" is mandatory
        And I have a "field A" of type "Email"
        And I am on "field A"
        And on "field A" I fill with <email>
        When I exit the "field A"
        Then I see a label message with an error

        Examples: 
            | email        |
            | ez.no@       |
            | ez.no        |
            | @$<example>% |
            | @ez.no       |
            |              |

    #email - Verify that no email validation is done when the user do not exit the email field
    #check the input is a valid email (this check is done only when the user leaves the input field)
    @ezp-21607 @qa-221
    Scenario Outline: Verify that no email validation is done when the user do not exit the email field
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And I am on "field A"
        And on "field A" I fill with <email>
        Then I see no label message with an error

        Examples: 
            | email              |
            | example.test@ez.no |
            | @ez.no             |

    #email -  A click on the label gives the focus to the input field
    #The label of the "field A"nd the input "field A"re connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript @ezp-21607 @qa-221
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And I have a label "L" with message "M1"
        When I click on label "L"
        Then I goto "field A"

    #email - Change the label when the user changes something
    #change when the user changes something
    @javascript @ezp-21607 @qa-221
    Scenario: Change the label when the user changes something
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And I have a label "L" with message "M1"
        When I update the "field A"
        And I see a label "L" with message "M2"
        And message "M2" is different from message "M1"

    #email - The label and the description come from the field definition in the Content Type.
    @javascript @ezp-21607 @qa-221
    Scenario: The label and the description come from the field definition in the Content Type
        Given I am logged in as "Admin"
        And I have a content type "B" with the following fields:
            | type_field | name_field  | description                |
            | Enail   | email_value | email_description_value |
        When I create a content "A" of content type "B"
        Then content "A" has a label "L1" in the email
        And content "A" has a description "D1" in the email
        And the "L1" has the value "email_value"
        And the "D1" has the value "email_description_value"
