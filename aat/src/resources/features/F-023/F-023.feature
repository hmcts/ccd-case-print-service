@F-023
Feature: F-023: Get Case as Printable Document

  Background: Load test data for the scenario
    Given an appropriate test context as detailed in the test data source

  @S-001
  Scenario: Must return a list of documents that can be printed
  Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
  And a case that has just been created as in [F-023_Case_Creation_Data_With_Document],
  When a request is prepared with appropriate values,
  And the request [contains a valid print URL configured in the definition file with a valid Jurisdiction and Case Type],
  And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
  Then a positive response is received,
  And the response has all the details as expected.
  #And the response [contains a list of documents with the following attributes for each document: Name, Document Type and Document Generation URL]. //we are not yet verifying the content of the returned document.

  @S-002 @Ignore
  Scenario: Must return a negative response when invalid URL defined in definition file
  Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
  And a case that has just been created as in [F-023_Case_Creation_Data_With_Document],
  When a request is prepared with appropriate values,
  And the request [contains an invalid URL configured in the definition file],
  And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
  Then a negative response is received,
  And the response has all the details as expected.

  @S-003 @Ignore
  Scenario: Must return a negative response on callback failure
  Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
  And a case that has just been created as in [F-023_Case_Creation_Data_With_Document],
  When a request is prepared with appropriate values,
  And the request [contains a callback which encounters a timeout error],
  And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
  Then a negative response is received,
  And the response has all the details as expected.

  @S-004
  Scenario: Must return a negative response on malformed Case ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a malformed case ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.

  @S-005
  Scenario: Must return a negative response on non existent Case ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a non existent case ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.

  @S-006
  Scenario: Must return a negative response on malformed Case Type ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a malformed caseType ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.

  @S-007
  Scenario: Must return a negative response on non existent Case Type ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a non existent caseType ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.

  @S-008
  Scenario: Must return a negative response on malformed jurisdiction ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a malformed jurisdiction ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.

  @S-009
  Scenario: Must return a negative response on non existent jurisdiction ID
    Given a user with [an active profile in CCD - who wants to see the content of a case as a printable document],
    When a request is prepared with appropriate values,
    And the request [contains a non existent jurisdiction ID],
    And it is submitted to call the [Get Case as Printable Document] operation of [CCD Case Print Service API],
    Then a negative response is received,
    And the response has all the details as expected.


