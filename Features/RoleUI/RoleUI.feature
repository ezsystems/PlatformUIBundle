Feature: Create, delete, update and View the Role UI
  In order to create, delete, update and view the ROLE UI
  As an Administrator user
  I need to be able to access and navigate through the Role UI interface

  Background:
    Given I am logged in as an Administrator in PlatformUI

  ##
  #
  # Validation Roles fields
  #
  ##
  @javascript @common
  Scenario: Verify the existence of Roles page and its content
    Given I am on the Home page
    And I have an "Organizers" role
    When I click on the Administration Dashboard Navigation Item
    And I click on the "Roles" link
    Then I see the Roles page
    And I see the following roles:
      | Name          | ID |
      | Anonymous     | 1  |
      | Administrator | 2  |
      | Editor        | 3  |
      | Partner       | 4  |
      | Member        | 5  |
      | Organizers    | 6  |
    And I see an "Edit" button for each one of the roles
    And I see a "Create" button

  @javascript @common
  Scenario: Verify the information displayed by one of the roles
    Given I am on the Roles page
    When I click on the "Anonymous" link
    Then I see the following limitations fields:
      | Module | Function | Limitation |
    And I should see an "Edit" button
    And I should see a "Delete" button
    And I should see a label for the Role Assigments
    And I should see a group with the Role Assigments
      | User/group | Limitation |

  @javascript @edge
  Scenario: Display the information of a role with empty policies
    Given an "Organizers" role exists
    And "Organizers" do not have any assigned policies
    And "Organizers" do not have any assigned Users and groups
    When I am viewing the "Organizers" role's details
    Then I should see that there are no policies set up for this role
    And I should see that this role has no Role Assigments

  ##
  #
  # Creating Roles
  #
  ##
  @javascript @common
  Scenario: Validate the existence of expected fields when creating a role
    Given I am on the Roles page
    When I create a new role
    Then I should see a "Name" field
    And I should see a "Save" button
    And I should see a "Cancel" button

  @javascript @common
  Scenario: create a valid role
    Given I am on the Roles page
    And I create a new role
    And I set "Organizers" as the "Name"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "Organizers" role exists

  @javascript @edge
  Scenario: create a valid role with japanese characters
    Given I am on the Roles page
    And I create a new role
    And I set "私は日本の名前で試してみる必要が" as the "Name"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "私は日本の名前で試してみる必要が" role exists

  @javascript @edge
  Scenario: creating a Role with an empty name triggers an obligation to fill the name
    Given I am on the Roles page
    And I create a new role
    And I set empty as the "Name"
    When I click on "Save" button
    Then I see a message asking for the field "Name" to be filled
    And the Role is not published

  @javascript @edge
  Scenario: creating a Role with an existing identifier fails validation
    Given an "Organizers" role exists
    And I create a new role
    And I set "Organizers" as the "Name"
    When I click on "Save" button
    Then I see a message saying that the name already exists
    And the Role is not published

  @javascript @common
  Scenario: cancel the creation of a role
    Given I am on the Roles page
    And I create a new role
    And I set "Organizers" as the "Name"
    When I click on "Cancel" button
    Then the Role is not published
    And I see that an "Organizers" role does not exist

  ##
  #
  # Updating Roles
  #
  ##
  @javascript @common
  Scenario: Validate the existence of expected fields when editing a role
    Given an "Organizers" role exists
    When I edit the "Organizers" role
    Then I should see an "Edit <Organizers>" label
    And I should see a "Name" field
    And I should see a "Save" button
    And I should see a "Cancel" button

  @javascript @common
  Scenario: Update a role
    Given an "Organizers" role exists
    And I edit the "Organizers" role
    And I set "old_Organizers" as the "Name"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "old_Organizers" role exists

  @javascript @edge
  Scenario: Updating a Role with an empty name triggers a message asking to fill the name
    Given an "Organizers" role exists
    And I edit the "Organizers" role
    And I set empty as the "Name"
    When I click on "Save" button
    Then I see a message asking for the field "Name" to be filled
    And the Role is not published

  @javascript @edge
  Scenario: Updating a Role with an existing identifier fails validation
    Given an "Organizers" role exists
    And I have a "Security" role
    And I edit the "Organizers" role
    And I set "Security" as the "Name"
    When I click on "Save" button
    Then I see a message saying that the name already exists
    And the Role is not published

  @javascript @common
  Scenario: cancel the update of a role
    Given an "Organizers" role exists
    And I edit the "Organizers" role
    And I set "Security" as the "Name"
    When I click on "Cancel" button
    Then the Role is not published
    And I see that an "Security" role does not exist

  ##
  #
  # Deleting Roles
  #
  ##
  @javascript @common
  Scenario: Delete a role
    Given an "Organizers" role exists
    When I delete the "Organizers" role
    Then the Role is successfully deleted
    And I see that an "Organizers" role does not exist
