import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import styles from './index.module.scss';
import { getDepartmentMembers } from '@/services/api.service';
import {  AccordionItem, CustomAccordion } from '../CustomAccordion';
import HTMLTimeline from '../HTMLTimeline';

function InternalTeamPage({ selectedTeam }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeam && selectedTeam._id && selectedTeam.org) {
      fetchTeamMembers();
    }
  }, [selectedTeam]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentMembers(selectedTeam.org, selectedTeam._id);
      setTeamMembers(response || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grouping team members by their team lead
  const teamLeads = teamMembers.filter((member) => member.roles.includes('team-lead'));
  const teamMembersGrouped = teamLeads.map((lead) => ({
    ...lead,
    members: teamMembers.filter(
      (member) =>
        member.roles.includes('team-member') &&
        member.reportingTo &&
        member.reportingTo._id === lead._id
    ),
  }));

  return (
    <div className={styles.teamContainer}>
      {loading ? (
        <p>Loading team members...</p>
      ) : (
        <div className="w-full">
          <CustomAccordion>
            {teamMembersGrouped.map((lead) => (
              <Droppable key={lead._id} droppableId={`lead-${lead._id}-${selectedTeam._id}`}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={styles.droppableLead}>
                    <AccordionItem title={`${selectedTeam.label} ( ${lead.firstName} ${lead.lastName} - TL )`}>
                      {/* <div>Team Lead: {lead.firstName} {lead.lastName}</div> */}
                      <div className={styles.memberAccordionContainer}>
                        {lead.members.length > 0 ? (
                          <CustomAccordion>
                            {lead.members.map((member) => (
                              <Droppable key={member._id} droppableId={`member-${member._id}`}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps} className={styles.droppableMember}>
                                    <AccordionItem title={`${member.firstName} ${member.lastName}`}>
                                      {/* <GoogleTimelineChart member={member} /> */}
                                    {/* <Timeline></Timeline>
                                    <NewTimeline></NewTimeline>
                                    <GoogleTimelineChart ></GoogleTimelineChart> */}
                                    {/* <JobTimeline member={undefined}></JobTimeline> */}
                                    <HTMLTimeline member={undefined}></HTMLTimeline>
                                    </AccordionItem>
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            ))}
                          </CustomAccordion>
                        ) : (
                          <p>No team members assigned.</p>
                        )}
                      </div>
                      {provided.placeholder}
                    </AccordionItem>
                  </div>
                )}
              </Droppable>
            ))}
          </CustomAccordion>
        </div>
      )}
    </div>
  );
}

export default InternalTeamPage;
