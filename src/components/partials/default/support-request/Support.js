import React from "react";
import UserAvatar from "../../../user/UserAvatar";
import { CardTitle, Badge, Card, CardHeader } from "reactstrap";
import { Link } from "react-router-dom";

const Support = ({ data, roles }) => {
  return (
    <React.Fragment>

      {roles.map((role) => (
        <div className="border-0">
          {(!data[role]?.users?.length && !data[role]?.userGroups?.length) && (
            <center>No User is found for {role}</center>
          )}
        </div>
      ))}


      {roles?.map((role) => (
        <>
          {data[role]?.users.length != 0 &&
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <CardTitle>
                  <h6 className="title">Users</h6>
                </CardTitle>
                <div className="card-tools">
                  <span className="link">Status</span>
                </div>
              </div>
            </div>}
        </>
      ))}



      {roles?.map((role) => (
        <React.Fragment key={role}>
          {data[role]?.users.length > 0 && (
            <ul className="nk-support">
              {data[role].users.map((user, idx) => (
                <>
                  {user.userName &&
                    <li className="nk-support-item" key={idx}>
                      <UserAvatar image={user?.imgUrl} theme="primary" text={user?.userName?.[0]} />
                      <div className="nk-support-content">
                        <div className="title">
                          <span>{user?.userName}</span>
                          <Badge
                            className="badge-dot badge-dot-xs"
                            color={
                              user?.status == "waiting" ? "warning" :
                                user?.status == "IP" ? "info" :
                                  user?.status == "Completed" ? "success" :
                                    user?.status == "Rejected" ? "danger" :
                                      "secondary"
                            }
                          >
                            {user?.status == 'waiting' && 'Yet To Start'}
                            {user?.status == 'IP' && 'In Review'}
                            {user?.status == 'Completed' && 'Approved'}
                            {user?.status == 'Rejected' && 'Rejected'}

                          </Badge>
                        </div>
                      </div>
                    </li>
                  }
                </>
              ))}
            </ul>
          )}
        </React.Fragment>
      ))}



      {/* {roles.map((role) => (
        <>
          {data[role]?.userGroups.length != 0 &&
            <div className="card-inner border-bottom">
              <div className="card-title-group">
                <CardTitle>
                  <h6 className="title">UserGroups</h6>
                </CardTitle>
                <div className="card-tools">
                  <Link to={`${process.env.PUBLIC_URL}/app-messages`} className="link">
                    Status
                  </Link>
                </div>
              </div>
            </div>}
        </>
      ))} */}



      {/* {roles.map((role) => (
        <React.Fragment key={role}>
          {data[role]?.userGroups.length > 0 && (
            <div>
              {data[role].userGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="mb-3">
                  <ul className="nk-support">
                    {group.userIds.map((user, idx) => (
                      <li className="nk-support-item" key={idx}>
                        <UserAvatar image={user.imgUrl} theme="secondary" text={user.userName[0]} />
                        <div className="nk-support-content">
                          <div className="title">
                            <span>{user.userName}</span>
                            <Badge
                              className="badge-dot badge-dot-xs"
                              color={
                                user.status == "waiting" ? "warning" :
                                  user.status == "IP" ? "info" :
                                    user.status == "Approved" ? "success" :
                                      user.status == "Rejected" ? "danger" :
                                        "secondary"
                              }
                            >
                              {user.status == 'waiting' && 'Yet To Start'}
                              {user.status == 'IP' && 'In Review'}
                              {user.status == 'Approved' && 'Approved'}
                              {user.status == 'Rejected' && 'Rejected'}

                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))} */}

      {roles.map((role) => (
        <React.Fragment key={role}>
          {data[role]?.userGroups.length > 0 && (
            <div>
              {data[role].userGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="mb-4">

                  <div className="card-inner border-bottom">
                    <div className="card-title-group">
                      <CardTitle>
                        <h6 className="title"> {group.groupName}</h6>
                      </CardTitle>
                      <div className="card-tools">
                        <span className="link">Status</span>
                      </div>
                    </div>
                  </div>

                  <ul className="nk-support">
                    {group.userIds.map((user, idx) => (
                      <li className="nk-support-item" key={idx}>
                        <UserAvatar image={user.imgUrl} theme="secondary" text={user.userName[0]} />
                        <div className="nk-support-content">
                          <div className="title">
                            <span>{user.userName}</span>
                            <Badge
                              className="badge-dot badge-dot-xs"
                              color={
                                user.status == "waiting" ? "warning" :
                                  user.status == "IP" ? "info" :
                                    user.status == "Completed" ? "success" :
                                      user.status == "Rejected" ? "danger" :
                                        "secondary"
                              }
                            >
                              {user.status == 'waiting' && 'Yet To Start'}
                              {user.status == 'IP' && 'In Review'}
                              {user.status == 'Completed' && 'Approved'}
                              {user.status == 'Rejected' && 'Rejected'}

                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}

    </React.Fragment >
  );
};

export default Support;
