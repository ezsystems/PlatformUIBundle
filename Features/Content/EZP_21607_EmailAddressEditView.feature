@editorial @ezp-21607
Feature: Test the validations done on Email field from Editorial Interface
    In order to use the email field of Y.eZ.EmailAddressEditView class
    As a user
    I want to validate the use of the email field data

    #https://confluence.ez.no/display/DEV/email
    
    #email - Validation on exiting the field using a valid email
    #check the input is a valid email (this check is done only when the user leaves the input field)
    #valid when the user input is valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate email when exiting the field using valid email
        Given I am logged in as "Anonymous"
        And I have a field A of type "Email"
        And field A is not mandatory
        And I fill the field A with the following data <email>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | email              |
            | example.test@ez.no |
            ||

    #email - Validation on exiting the field using an invalid email
    #check the input is a valid email (this check is done only when the user leaves the input field)
    #error when the user input is not valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate email when exiting the field using invalid email
        Given I am logged in as "Anonymous"
        And field A is mandatory
        And I have a field A of type "Email"
        And I fill the field A with the following data <email>
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | email         |
            | ez.no@        |
            | ez.no         |
            | @#$<example>% |
            | @ez.no        |
            ||

    #email - Verify that no email validation is done when the user do not exit the email field
    #check the input is a valid email (this check is done only when the user leaves the input field)
    @javascript
    Scenario Outline: Verify that no email validation is done when the user do not exit the email field
        Given I am logged in as "Anonymous"
        And I have a field A of type "Email"
        When I fill the field A with the following data <email>
        Then I see no label message with an error

        Examples:
            | email              |
            | example.test@ez.no |
            | @ez.no             |

    #email -  A click on the label gives the focus to the input field
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Anonymous"
        And I have a field A of type "Email"
        And I have a label L with message M1
        When I click on label L
        Then I goto field A

    #email - Change the label when the user changes something
    #change when the user changes something
    @javascript
    Scenario: Change the label when the user changes something
        Given I am logged in as "Anonymous"
        And I have a field A of type "Email"
        And I have a label L with message M1
        When I update the field A
        And I see a label L with message M2
        And message M2 is different from message M1