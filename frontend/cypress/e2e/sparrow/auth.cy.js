describe('Authentication', () => {
  beforeEach(() => {
    cy.cleanupTestData()
  })

  describe('Sign Up', () => {
    it('should complete the full signup process', () => {
      cy.visit('/signup')
      
      const timestamp = Date.now()
      const testUser = {
        fullName: 'Test User',
        username: `test${timestamp}`.slice(0, 18),
        email: `test${timestamp}@example.com`,
        password: 'password123'
      }
      
      // Step 1: Personal Info
      cy.get('#fullName').type(testUser.fullName)
      cy.get('#email').type(testUser.email)
      cy.get('button[type="submit"]').click()
      
      // Step 2: Account Details
      cy.get('#username').type(testUser.username)
      cy.get('#password').type(testUser.password)
      cy.get('#confirmPassword').type(testUser.password)
      
      // Wait for username check and submit
      cy.wait(1500)
      cy.get('button[type="submit"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard', { timeout: 10000 })
      
      // Verify logout button is present
      cy.get('button[title="Logout"]').should('be.visible')
    })

    it('should show validation errors', () => {
      cy.visit('/signup')
      cy.get('button[type="submit"]').click()
      cy.contains('Full name is required').should('be.visible')
    })

    it('should navigate to sign in', () => {
      cy.visit('/signup')
      cy.contains('Sign in').click()
      cy.url().should('include', '/signin')
    })
  })

  describe('Sign In', () => {
    beforeEach(() => {
      cy.createTestUser({
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should sign in successfully', () => {
      cy.visit('/signin')
      
      cy.get('#email').type('test@example.com')
      cy.get('#password').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('button[title="Logout"]').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/signin')
      
      cy.get('#email').type('wrong@example.com')
      cy.get('#password').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Invalid email or password').should('be.visible')
    })

    it('should navigate to sign up', () => {
      cy.visit('/signin')
      cy.contains('Sign up').click()
      cy.url().should('include', '/signup')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to home', () => {
      cy.visit('/dashboard')
      cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    })

    it('should allow authenticated access', () => {
      cy.login()
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.get('button[title="Logout"]').should('be.visible')
    })
  })
})