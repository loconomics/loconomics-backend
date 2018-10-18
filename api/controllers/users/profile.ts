declare var sails: any;

module.exports = {
  friendlyName: 'Fetches user public profile information.',
  description: 'Basic info as name (firstName, lastName,..), publicBio, \
    contact data (email, phone), isFreelancer flag. \
    When service professional, other fields are included as businessName, \
    websiteUrl (is contact data), profileUrlSlug.',
  inputs: {
    id: {
      example: '141',
      required: true
    }
  },
  exits: {
    success: {
      outputExample: {
        businessName: 'Loconomics',
        email: 'iago@loconomics.com',
        firstName: 'Iago',
        isClient: true,
        isOrganization: false,
        isServiceProfessional: true,
        lastName: 'Lorenzo Salgueiro',
        orgDescription: 'Tools for small business owners',
        orgName: 'Loconomics',
        orgWebsite: 'https://dev.loconomics.com',
        phone: '720-555-5555',
        photoUrl: 'https://dev.loconomics.com/en-US/Profile/Photo/141?v=2018-09-19T18:47:48',
        publicBio: 'My public bio.',
        secondLastName: '',
        serviceProfessionalProfileUrl: 'https://dev.loconomics.com/-iagosrl',
        serviceProfessionalProfileUrlSlug: 'iagosrl',
        serviceProfessionalWebsiteUrl: 'https://dev.loconomics.com',
        timeZone: 'America/Los_Angeles',
        updatedDate: '2018-09-19T18:47:48.637-07:00',
        userID: 141
      }
    },
    notFound: {
      responseType: 'notFound'
    }
  },
  fn: async function(inputs, exits) {
    const targetUserId = this.req.param('id')
    const requesterUserId = !!this.req.user
      ? this.req.user.UserID
      : -1

    const sql = await sails.helpers.mssql()
    const profileData = await sql.query(`SELECT TOP 1
                -- ID
                Users.userID
                -- Name
                ,firstName
                ,lastName
                ,secondLastName
                ,businessName
                ,publicBio
                -- User Type
                ,isProvider as isServiceProfessional
                ,isCustomer as isClient
                ,CASE WHEN PC.Active = 1 OR ${targetUserId} = ${requesterUserId} THEN UP.email ELSE null END as Email
                ,CASE WHEN PC.Active = 1 OR ${targetUserId} = ${requesterUserId} THEN Users.MobilePhone ELSE null END As phone
                ,CASE WHEN PC.Active = 1 OR ${targetUserId} = ${requesterUserId} THEN providerWebsiteUrl ELSE null END as serviceProfessionalWebsiteUrl
                ,providerProfileUrl as serviceProfessionalProfileUrlSlug
                ,cpa.timeZone as timeZone
                ,users.isOrganization as isOrganization
                ,org.orgName as orgName
                ,org.orgDescription as orgDescription
                ,org.orgWebsite as orgWebsite
                ,Users.updatedDate
            FROM Users
                    INNER JOIN
                UserProfile As UP
                    ON UP.UserID = Users.UserID
                    LEFT JOIN
                ServiceProfessionalClient As PC
                    ON
                    (   PC.ServiceProfessionalUserID = ${targetUserId} AND PC.ClientUserID = ${requesterUserId}
                     OR PC.ServiceProfessionalUserID = ${requesterUserId} AND PC.ClientUserID = ${targetUserId} )
                    LEFT JOIN
                CalendarProviderAttributes as cpa
                    ON cpa.UserID = Users.UserID
                    LEFT JOIN
                userOrganization as org
                    ON org.userID = Users.userID
            WHERE Users.UserID = ${targetUserId}
                -- Users must be active (no deleted and publicly active) OR to exist in relationship with the other user (active or not, but with record)
              AND (Users.Active = 1 AND Users.AccountStatusID = 1 OR PC.Active is not null)`)
    const userProfile = profileData.recordset[0]
    if (!userProfile)
      return exits.notFound()

    const {baseUrl} = this.req
    const updatedDate = new Date(userProfile.updatedDate).toISOString()

    // Build photo URL
    const lang = this.req.headers['accept-language']
    const updatedSecondPrecision = updatedDate.split('.')[0]
    const photoUrl = `${baseUrl}/${lang}/Profile/Photo/${targetUserId}?v=${updatedSecondPrecision}`

    // Build serviceProfessionalProfileUrl from serviceProfessionalProfileUrlSlug
    const customUrlPrefix = '-'
    const slug = userProfile.serviceProfessionalProfileUrlSlug
    const {stringSlugify} = sails.helpers
    const serviceProfessionalProfileUrl = !!slug
      ? `${baseUrl}/${customUrlPrefix}${stringSlugify(slug)}`
      : ''

    const record = {
      businessName: userProfile.businessName,
      email: userProfile.Email,
      firstName: userProfile.firstName,
      isClient: userProfile.isClient,
      isOrganization: userProfile.isOrganization,
      isServiceProfessional: userProfile.isServiceProfessional,
      lastName: userProfile.lastName,
      orgDescription: userProfile.orgDescription,
      orgName: userProfile.orgName,
      orgWebsite: userProfile.orgWebsite,
      phone: userProfile.phone,
      photoUrl: photoUrl,
      publicBio: userProfile.publicBio,
      secondLastName: userProfile.secondLastName,
      serviceProfessionalProfileUrl: serviceProfessionalProfileUrl,
      serviceProfessionalProfileUrlSlug: userProfile.serviceProfessionalProfileUrlSlug,
      serviceProfessionalWebsiteUrl: userProfile.serviceProfessionalWebsiteUrl,
      timeZone: userProfile.timeZone,
      updatedDate: `${updatedDate.split('Z')[0]}-07:00`,
      userID: userProfile.UserID
    }
    return exits.success(record)
  }
}
