const menu = [{
  text: "Admin Tools",
  subMenu: [
    {
      text: "Access Overview",
      link: "/accessOverview",
      active: "false",
    },
    {
      text: "Metadata",
      active: "false",
      subMenu: [
        {
          text: "Custom Metadata",
          link: "/metaData",
        },
        {
          text: "Document Type",
          link: "/DocumentType",
        },
        // {
        //   text: "Secondary Document Type",
        //   link: "/secondaryDocumentType",
        // },
        {
          text: "Keywords",
          link: "/keywords",
        }
      ]
    },
    {
      text: "Templates",
      active: "false",
      subMenu: [
        {
          text: "Workflow",
          link: "/workflow",
        },
        {
          text: "Forms",
          link: "/formBuild",
        },
      ]
    }
  ],
},
{
  text: "Users",
  link: "/users",
  active: "false",
},
{
  text: "User Groups",
  link: "/usergroups",
  active: "false",
},
{
  text: "Workflow",
  subMenu: [
    {
      text: "My Approvals",
      link: "/workflowPendings",
      active: "false",
    },
    {
      text: "Approvals History",
      link: "/approvalHistory",
      active: "false",
    },
    {
      text: "My Submitted Documents",
      link: "/ownerHistory",
      active: "false",
    }
  ],
},
{
  text: "Metadata Approval",
  link: "/metadataApproval",
  active: "false",
  badge: true
},

];
export default menu;
