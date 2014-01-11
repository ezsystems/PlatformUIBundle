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
    @javascript @ezp-21607
    Scenario Outline: Validate email when exiting the field using valid email
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And "field A" is not mandatory
        And I am on "field A"
        And I fill the "field A" with the following data <email>
        When I exit the "field A"
        Then I see no label message with an error

        Examples:
            | email              |
            | example.test@ez.no |
            ||

    #email - Validation on exiting the field using an invalid email
    #check the input is a valid email (this check is done only when the user leaves the input field)
    #error when the user input is not valid
    #check whether the input is filled (if the field is set required)
    @javascript @ezp-21607
    Scenario Outline: Validate email when exiting the field using invalid email
        Given I am logged in as "Admin"
        And "field A" is mandatory
        And I have a "field A" of type "Email"
        And I am on "field A"
        And on "field A" I fill with <email>
        When I exit the "field A"
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
    @javascript @ezp-21607
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
    @javascript @ezp-21607
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And I have a label "L" with message "M1"
        When I click on label "L"
        Then I goto "field A"

    #email - Change the label when the user changes something
    #change when the user changes something
    @javascript @ezp-21607
    Scenario: Change the label when the user changes something
        Given I am logged in as "Admin"
        And I have a "field A" of type "Email"
        And I have a label "L" with message "M1"
        When I update the "field A"
        And I see a label "L" with message "M2"
        And message "M2" is different from message "M1"
        
    #https://confluence.ez.no/display/DEV/IntegerEditView
    #IntegerEditView - Validation on exiting the field using a valid integer
    #valid when the user input is valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using valid data
        Given I am logged in as "Admin"
        And I have a field A of type "Integer"
        And field A is not mandatory
        And I fill the field A with the following <integer>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | integer |
            | 3       |
            | -3      |
            | 0       |
            ||

    #IntegerEditView - Validation on exiting the field using an invalid integer
    #error when the user input is not valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using invalid integer
        Given I am logged in as "Admin"
        And I have a field A of type "Integer"
        And I fill the field A with the following <integer>
        And field A is mandatory
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | integer |
            | a       |
            | 1.5     |
            | -1.5    |
            | 1,5     |
            | -1,5    |
            ||

    #IntegerEditView - Valid values within defined range - within, equal to superior, equal to inferior
    #check that the integer is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a IntegerEditView fieldtype filled with within range values 
        Given I am logged in as "Admin"
        And I have a field A of type "IntegerEditView"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <integer>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | integer |
            | 3       |
            | 1       |
            | 10      |

    #IntegerEditView - use of invalid value - out of superior and inferior range
    #check that the integer is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a IntegerEditView fieldtype filled with out of range values 
        Given I am logged in as "Admin"
        And I have a field A of type "IntegerEditView"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <integer>
        When I exit the field A
        Then I see a label message with an error
    
        Examples:
            | integer |
            | 0    |
            | 11   |

    #IntegerEditView -  A click on the label gives the focus to the input field
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a field A of type "IntegerEditView"
        And I have a label L with message M1
        When I click on label L
        Then I goto field A

    #IntegerEditView - Change the label when the user changes data
    #change when the user changes something
    @javascript
    Scenario: Change the label when the user changes data
        Given I am logged in as "Admin"
        And I have a field A of type "IntegerEditView"
        And I have a label L with message M1
        When I update the field A
        And I see a label L with message M2
        And message M2 is different from message M1

    #https://confluence.ez.no/display/DEV/float
    #valid when the user input is valid
    #check whether the input is filled (if the Field is set required)
    #float - check that the input is a float (done while typing)
    @javascript
    Scenario Outline: Validate float when exiting the field using valid data
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And field A is not mandatory
        When I fill the field A with the following <float>
        Then I see no label message with an error

        Examples:
            | float |
            | 3.15  |
            | -3.15 |
            | 3,15  |
            | -3,15 |
            | 0     |
            ||

    #float - check that the input is a float (done while typing)
    @javascript
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I fill the field A with the following <float>
        Then I see a label message with an error

        Examples:
            | float |
            | a     |

    #float - check whether the input is filled (if the Field is set required)
    @javascript
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I fill the field A with the following <float>
        And field A is mandatory
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | float |
            ||

    #float - Valid values within defined range - within, equal to superior, equal to inferior
    #check that the float is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a float fieldtype filled with within range values 
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <float>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | float |
            | 3.15  |
            | 1     |
            | 10    |
            | 5.5   |
            | 5,5   |
            | 5     |

    #float - use of invalid value - out of superior and inferior range
    #check that the float is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a float fieldtype filled with out of range values 
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <float>
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | float |
            | 0     |
            | 11    |

    #float -  A click on the label gives the focus to the input field
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I have a label L with message M1
        When I click on label L
        Then I goto field A
    
    #float - Change the label when the user changes something
    #change when the user changes something
    @javascript
    Scenario: Change the label when the user changes something
        Given I am logged in as "Admin"
        And I have a field A of type "float"
        And I have a label L with message M1
        When I update the field A
        And I see a label L with message M2
        And message M2 is different from message M1
