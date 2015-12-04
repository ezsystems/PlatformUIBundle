Feature: Create, delete, update and View the Role UI
  In order to create, delete, update and view the ROLE UI
  As an Administrator user
  I need to be able to access and navigate through the Role UI interface

  Background:
    Given I am logged in as admin on PlatformUI

  ##
  #
  # Validation Roles fields
  #
  ##
  @javascript @common
  Scenario: Verify the existence of Roles page and its content
    Given an "Organizers" role exists
    When I click on the navigation zone "Admin Panel"
    And I click on the navigation item "Roles"
    Then I see the Roles page
    And I see the following roles with an 'Edit role name' button:
      | Name          |
      | Anonymous     |
      | Administrator |
      | Editor        |
      | Organizers    |
    And I should see a "Create a role" button

  @javascript @common
  Scenario: Verify the information displayed by one of the roles
    Given I am on the Roles page
    When I click on the "Anonymous" link
    Then I see the following limitations fields:
      | Module | Function | Limitation |
    And I should see an "Edit role name" button
    And I should see a "Delete" button
    And I should see a "Add a new policy" button

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
    Then I should see a "Name" input field
    And I should see a "Save" button
    And I should see a "Cancel" button

  @javascript @common
  Scenario: Create a valid role
    Given I am on the Roles page
    And I create a new role
    And I fill in "Name" with "Organizers"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "Organizers" role exists

  @javascript @edge
  Scenario: create a valid role with japanese characters
    Given I am on the Roles page
    And I create a new role
    And I fill in "Name" with "私は日本の名前で試してみる必要が"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "私は日本の名前で試してみる必要が" role exists

  @javascript @edge
  Scenario: creating a Role with an empty name triggers an obligation to fill the name
    Given I am on the Roles page
    And I create a new role
    And I set "Name" as empty
    When I click on "Save" button
    Then I see a message asking for the field "Name" to be filled

  @javascript @edge
  Scenario: creating a Role with an existing identifier fails validation
    Given an "Organizers" role exists
    And I am on the Roles page
    And I create a new role
    And I fill in "Name" with "Organizers"
    When I click on "Save" button
    Then I see a message saying that the name "Organizers" already exists
    And the Role "Organizers" is not published

  @javascript @common
  Scenario: cancel the creation of a role
    Given I am on the Roles page
    And I create a new role
    And I fill in "Name" with "Organizer"
    When I click on "Cancel" button
    Then the Role "Organizer" is not published
    And I see that an "Organizer" role does not exists

  ##
  #
  # Updating Roles
  #
  ##
  @javascript @common
  Scenario: Validate the existence of expected fields when editing a role
    Given an "Organizers" role exists
    And I am on the Roles page
    When I edit the "Organizers" role name
    Then I should see "Edit <Organizers>" title
    And I should see a "Name" input field
    And I should see a "Save" button
    And I should see a "Cancel" button

  @javascript @common
  Scenario: Update a role
    Given an "Organizers" role exists
    And I am on the Roles page
    And I edit the "Organizers" role name
    And I fill in "Name" with "old_Organizers"
    When I click on "Save" button
    Then the Role is successfully published
    And I see that an "old_Organizers" role exists

  @javascript @edge
  Scenario: Updating a Role with an empty name triggers a message asking to fill the name
    Given an "Organizers" role exists
    And I am on the Roles page
    And I edit the "Organizers" role name
    And I set "Name" as empty
    When I click on "Save" button
    Then I see a message asking for the field "Name" to be filled

  @javascript @edge @broken
  Scenario: Updating a Role with an existing identifier fails validation
    Given an "Organizers" role exists
    And a "Security" role exists
    And I am on the Roles page
    And I edit the "Organizers" role name
    And I fill in "Name" with "Security"
    When I click on "Save" button
    Then I see a message saying that the name "Security" already exists

  @javascript @common
  Scenario: Cancel the update of a role
    Given an "Organizers" role exists
    And I am on the Roles page
    And I edit the "Organizers" role name
    And I fill in "Name" with "Security"
    When I click on "Cancel" button
    Then the Role "Security" is not published
    And I see that an "Security" role does not exists

  ##
  #
  # Deleting Roles
  #
  ##
  @javascript @common
  Scenario: Delete a role
    Given an "Organizers" role exists
    And I am on the Roles page
    When I delete the "Organizers" role
    Then the Role "Organizers" is successfully deleted
    And I see that an "Organizers" role does not exists
