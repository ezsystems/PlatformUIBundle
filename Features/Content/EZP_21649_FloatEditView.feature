@editorial @ezp-21649
Feature: Test the validations done on FloatEditView field from Editorial Interface
In order to use the FloatEditView field
As a user
I want to validate the use of the FloatEditView field data

#https://confluence.ez.no/display/DEV/FloatEditView
    
#valid when the user input is valid
#check whether the input is filled (if the Field is set required)
#check that the input is a float (done while typing)
Scenario Outline: Validate FloatEditView when exiting the field using valid data
Given i am logged in as "Anonymous"
  And i have a field A of type "FloatEditView"
  And field A is not mandatory
 When i fill the field A with the following "<float>"
 Then I see no label message with an error

 Examples:
    | float |
    | 3.15  |
    | -3.15 |
    | 0     |
    ||

#check that the input is a float (done while typing)
Scenario Outline: Validate FloatEditView when exiting the field using invalid float
Given i am logged in as "Anonymous"
  And i have a field A of type "FloatEditView"
  And i fill the field A with the following "<float>"
 Then I see a label message with an error

 Examples:
    | float |
    | a     |

#check whether the input is filled (if the Field is set required)
Scenario Outline: Validate FloatEditView when exiting the field using invalid float
Given i am logged in as "Anonymous"
  And i have a field A of type "FloatEditView"
  And i fill the field A with the following "<float>"
  And field A is mandatory
 When i exit the field A
 Then I see a label message with an error

 Examples:
    | float |
    ||

#FloatEditView - Valid values within defined range - within, equal to superior, equal to inferior
#check that the float is in the correct range (if the field definition is configured with a min and/or max value)
Scenario Outline: Create an object that has a FloatEditView fieldtype filled with within range values 
Given i am logged in as an admin user
  And i have a field A of type "FloatEditView"
  And i defined an inferior and superior range for field A
  | 1 | 10 |
  And i fill the field A with the following data "<float>"
 When i exit the field A
 Then I see no label message

 Examples:
    | field      | data |
    | FloatField | 3.15 |
    | FloatField | 1    |
    | FloatField | 10   |

#FloatEditView - use of invalid value - out of superior and inferior range
#check that the float is in the correct range (if the field definition is configured with a min and/or max value)
Scenario Outline: Create an object that has a FloatEditView fieldtype filled with out of range values 
Given i am logged in as an admin user
  And i have a field A of type "FloatEditView"
  And i defined an inferior and superior range for field A
  | 1 | 10 |
  And i fill the field A with the following data "<float>"
 When i exit the field A
 Then I see a label message with an error

Examples:
    | field      | data |
    | FloatField | 0    |
    | FloatField | 11   |

#FloatEditView -  A click on the label gives the focus to the input field
#The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
Scenario: Verify that a click on the label gives the focus to the input field
Given i am logged in as "Anonymous"
  And i have a field A of type "FloatEditView"
  And i have a label L with message M1
 When i click on label L
 Then i goto field A

#FloatEditView - Change the label when the user changes something
#change when the user changes something
Scenario: Change the label when the user changes something
Given i am logged in as "Anonymous"
  And i have a field A of type "FloatEditView"
  And i have a label L with message M1
 When i update the field A
  And i see a label L with message M2
  And message M2 is different from message M1
