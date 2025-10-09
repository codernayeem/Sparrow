// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login with test user
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/signin')
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Custom command to create a test user (handles multi-step signup)
Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    username: 'testuser'
  }
  
  const user = { ...defaultUser, ...userData }
  
  // Use the API directly instead of going through the UI
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/signup`,
    body: {
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      password: user.password
    },
    failOnStatusCode: false
  })
})

// Custom command to complete multi-step signup via UI
Cypress.Commands.add('signUpViaUI', (userData = {}) => {
  const defaultUser = {
    fullName: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  }
  
  const user = { ...defaultUser, ...userData }
  
  cy.visit('/signup')
  
  // Step 1: Personal Info
  cy.get('#fullName').type(user.fullName)
  cy.get('#email').type(user.email)
  cy.get('button[type="submit"]').click()
  
  // Step 2: Account Details
  cy.get('#username').type(user.username)
  cy.get('#password').type(user.password)
  cy.get('#confirmPassword').type(user.password)
  
  // Wait for username availability check
  cy.wait(1500)
  
  cy.get('button[type="submit"]').click()
  
  // Wait for success and redirect
  cy.contains('Account Created Successfully!').should('be.visible')
  cy.url().should('include', '/dashboard', { timeout: 10000 })
})

// Custom command to clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  // This would ideally clean up test data from the database
  // For now, we'll just clear cookies and local storage
  cy.clearCookies()
  cy.clearLocalStorage()
})

// Custom command to check if user is authenticated
Cypress.Commands.add('checkAuth', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/auth/me`,
    failOnStatusCode: false
  })
})

// Custom command to create a test post
Cypress.Commands.add('createTestPost', (postData = {}) => {
  const defaultPost = {
    text: 'This is a test post created by Cypress'
  }
  
  const post = { ...defaultPost, ...postData }
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/posts/create`,
    body: post,
    failOnStatusCode: false
  })
})

// Custom command to wait for element to be visible and interactable
Cypress.Commands.add('waitAndClick', (selector, options = {}) => {
  cy.get(selector, options).should('be.visible').click()
})

// Custom command to type text with realistic typing speed
Cypress.Commands.add('typeRealistic', { prevSubject: 'element' }, (subject, text, options = {}) => {
  cy.wrap(subject).type(text, { delay: 100, ...options })
})

// Custom command to upload file
Cypress.Commands.add('uploadFile', (selector, fileName, fileType = 'image/jpeg') => {
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from('fake file content'),
    fileName: fileName,
    mimeType: fileType,
  })
})

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })