import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Avatar, 
  Input, 
  Textarea,
  Button, 
  Divider,
  Grid,
  AspectRatio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/joy';
import Drawer from './Drawer'

const ElectionRoom = ({ roomNumber, participants }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        indicator={expanded ? '▲' : '▼'}
        aria-controls={`room${roomNumber}-content`}
        id={`room${roomNumber}-header`}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          },
        }}
      >
        <Typography level="h6" sx={{ mb: 1, width:"100px"}}>Room {roomNumber}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
          {participants.map((participant, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
              <Avatar src={participant.avatar} alt={participant.name} size="sm" />
              <Typography level="body2" sx={{ ml: 1 }}>
                {participant.name} ({participant.votes})
              </Typography>
            </Box>
          ))}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {participants.map((participant, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar src={participant.avatar} alt={participant.name} />
              <Typography level="body1" sx={{ ml: 2 }}>
                {participant.name} - {participant.votes} votes
              </Typography>
            </Box>
            {participant.contributions.map((contribution, cIndex) => (
              <Card key={cIndex} variant="outlined" sx={{ mt: 1, p: 2 }}>
                <Typography level="h6">{contribution.title}</Typography>
                <Typography level="body2">{contribution.description}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {contribution.proofs.map((proof, pIndex) => (
                    <Chip
                      key={pIndex}
                      variant="outlined"
                      color="primary"
                      component="a"
                      href={proof.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                    >
                      {proof.title}
                    </Chip>
                  ))}
                </Box>
              </Card>
            ))}
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const PreviousElectionCard = ({ electionNumber, startDate, endDate, rooms }) => {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <Typography level="h3" gutterBottom>
        Election #{electionNumber}
      </Typography>
      <Typography level="body1" gutterBottom>
        {startDate} - {endDate}
      </Typography>
      {rooms.map((room, index) => (
        <ElectionRoom key={index} roomNumber={room.number} participants={room.participants} />
      ))}
    </Card>
  );
};

function GamePage() {
  const [previousElections] = useState([
    {
      number: 1,
      startDate: '10 Aug, 7pm UTC',
      endDate: '12 Aug, 7pm UTC',
      rooms: [
        {
          number: 1,
          participants: [
            {
              name: 'Alice',
              avatar: './placeholderimage.jpg',
              votes: 7,
              contributions: [
                {
                  title: 'Code Review',
                  description: 'Reviewed and improved 5 pull requests',
                  proofs: [
                    { title: 'PR #123', link: '#' },
                    { title: 'PR #124', link: '#' }
                  ]
                },
                {
                  title: 'Documentation Update',
                  description: 'Updated the project README and contributing guidelines',
                  proofs: [
                    { title: 'Commit abc123', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Bob',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'Bug Fix',
                  description: 'Fixed a critical bug in the payment system',
                  proofs: [
                    { title: 'Issue #456', link: '#' },
                    { title: 'PR #789', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Charlie',
              avatar: './placeholderimage.jpg',
              votes: 3,
              contributions: [
                {
                  title: 'New Feature',
                  description: 'Implemented user profile customization',
                  proofs: [
                    { title: 'Feature spec', link: '#' },
                    { title: 'PR #101', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Diana',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'Performance Optimization',
                  description: 'Improved database query performance by 30%',
                  proofs: [
                    { title: 'Benchmark results', link: '#' },
                    { title: 'PR #202', link: '#' }
                  ]
                }
              ]
            }
          ]
        },
        {
          number: 2,
          participants: [
            {
              name: 'Ethan',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'UI Redesign',
                  description: 'Redesigned the dashboard for better user experience',
                  proofs: [
                    { title: 'Design mockups', link: '#' },
                    { title: 'PR #303', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Fiona',
              avatar: './placeholderimage.jpg',
              votes: 8,
              contributions: [
                {
                  title: 'API Integration',
                  description: 'Integrated third-party payment gateway',
                  proofs: [
                    { title: 'API documentation', link: '#' },
                    { title: 'PR #404', link: '#' }
                  ]
                },
                {
                  title: 'Security Audit',
                  description: 'Conducted a security audit and fixed vulnerabilities',
                  proofs: [
                    { title: 'Audit report', link: '#' },
                    { title: 'PR #505', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'George',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'Localization',
                  description: 'Added support for 3 new languages',
                  proofs: [
                    { title: 'Translation files', link: '#' },
                    { title: 'PR #606', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Hannah',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'Testing Framework',
                  description: 'Set up automated testing infrastructure',
                  proofs: [
                    { title: 'Test plan', link: '#' },
                    { title: 'PR #707', link: '#' }
                  ]
                }
              ]
            }
          ]
        },
        {
          number: 3,
          participants: [
            {
              name: 'Ian',
              avatar: './placeholderimage.jpg',
              votes: 7,
              contributions: [
                {
                  title: 'Data Analysis',
                  description: 'Analyzed user behavior and provided insights',
                  proofs: [
                    { title: 'Analysis report', link: '#' },
                    { title: 'Dashboard PR #808', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Julia',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'Mobile App Feature',
                  description: 'Implemented push notifications for mobile app',
                  proofs: [
                    { title: 'Feature spec', link: '#' },
                    { title: 'PR #909', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Kevin',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'DevOps Improvement',
                  description: 'Set up continuous deployment pipeline',
                  proofs: [
                    { title: 'Pipeline config', link: '#' },
                    { title: 'PR #1010', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Liam',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'User Support',
                  description: 'Resolved 50+ user tickets and improved FAQ',
                  proofs: [
                    { title: 'Support metrics', link: '#' },
                    { title: 'FAQ update PR #1111', link: '#' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      number: 2,
      startDate: '10 Aug, 7pm UTC',
      endDate: '12 Aug, 7pm UTC',
      rooms: [
        {
          number: 1,
          participants: [
            {
              name: 'Alice',
              avatar: './placeholderimage.jpg',
              votes: 7,
              contributions: [
                {
                  title: 'Code Review',
                  description: 'Reviewed and improved 5 pull requests',
                  proofs: [
                    { title: 'PR #123', link: '#' },
                    { title: 'PR #124', link: '#' }
                  ]
                },
                {
                  title: 'Documentation Update',
                  description: 'Updated the project README and contributing guidelines',
                  proofs: [
                    { title: 'Commit abc123', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Bob',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'Bug Fix',
                  description: 'Fixed a critical bug in the payment system',
                  proofs: [
                    { title: 'Issue #456', link: '#' },
                    { title: 'PR #789', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Charlie',
              avatar: './placeholderimage.jpg',
              votes: 3,
              contributions: [
                {
                  title: 'New Feature',
                  description: 'Implemented user profile customization',
                  proofs: [
                    { title: 'Feature spec', link: '#' },
                    { title: 'PR #101', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Diana',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'Performance Optimization',
                  description: 'Improved database query performance by 30%',
                  proofs: [
                    { title: 'Benchmark results', link: '#' },
                    { title: 'PR #202', link: '#' }
                  ]
                }
              ]
            }
          ]
        },
        {
          number: 2,
          participants: [
            {
              name: 'Ethan',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'UI Redesign',
                  description: 'Redesigned the dashboard for better user experience',
                  proofs: [
                    { title: 'Design mockups', link: '#' },
                    { title: 'PR #303', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Fiona',
              avatar: './placeholderimage.jpg',
              votes: 8,
              contributions: [
                {
                  title: 'API Integration',
                  description: 'Integrated third-party payment gateway',
                  proofs: [
                    { title: 'API documentation', link: '#' },
                    { title: 'PR #404', link: '#' }
                  ]
                },
                {
                  title: 'Security Audit',
                  description: 'Conducted a security audit and fixed vulnerabilities',
                  proofs: [
                    { title: 'Audit report', link: '#' },
                    { title: 'PR #505', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'George',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'Localization',
                  description: 'Added support for 3 new languages',
                  proofs: [
                    { title: 'Translation files', link: '#' },
                    { title: 'PR #606', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Hannah',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'Testing Framework',
                  description: 'Set up automated testing infrastructure',
                  proofs: [
                    { title: 'Test plan', link: '#' },
                    { title: 'PR #707', link: '#' }
                  ]
                }
              ]
            }
          ]
        },
        {
          number: 3,
          participants: [
            {
              name: 'Ian',
              avatar: './placeholderimage.jpg',
              votes: 7,
              contributions: [
                {
                  title: 'Data Analysis',
                  description: 'Analyzed user behavior and provided insights',
                  proofs: [
                    { title: 'Analysis report', link: '#' },
                    { title: 'Dashboard PR #808', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Julia',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'Mobile App Feature',
                  description: 'Implemented push notifications for mobile app',
                  proofs: [
                    { title: 'Feature spec', link: '#' },
                    { title: 'PR #909', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Kevin',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'DevOps Improvement',
                  description: 'Set up continuous deployment pipeline',
                  proofs: [
                    { title: 'Pipeline config', link: '#' },
                    { title: 'PR #1010', link: '#' }
                  ]
                }
              ]
            },
            {
              name: 'Liam',
              avatar: './placeholderimage.jpg',
              votes: 4,
              contributions: [
                {
                  title: 'User Support',
                  description: 'Resolved 50+ user tickets and improved FAQ',
                  proofs: [
                    { title: 'Support metrics', link: '#' },
                    { title: 'FAQ update PR #1111', link: '#' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  return (
    <Box className="gamepage">
      <Drawer />
      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Card variant="outlined">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <AspectRatio ratio="1" sx={{ width: 80, borderRadius: 'md' }}>
                <img src="./placeholderimage.jpg" alt="Community" />
              </AspectRatio>
              <Box>
                <Typography level="h4">Upscale</Typography>
                <Typography level="body2">Community on Antelope</Typography>
                <Typography level="body2" sx={{ mt: 1 }}>
                  25 members | 5 respect games
                </Typography>
              </Box>
            </Box>
            <Typography level="h5" sx={{ mt: 3, mb: 2 }}>
              Respected Members
            </Typography>
            {['John', 'Alice', 'Bob'].map((name, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src="./placeholderimage.jpg" alt={name} />
                <Typography level="body1" sx={{ ml: 2 }}>
                  {name}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
        <Grid xs={12} md={7}>
          {/* Ongoing Election Card */}
          <Card variant="outlined">
            <Typography level="h2" gutterBottom>
              Election #2
            </Typography>
            <Typography level="body1" gutterBottom>
              Ends in 2 days (19 Aug, 7pm UTC)
            </Typography>
            <Typography level="p" sx={{ mt: 3, mb: 2 }}>
              Election is happening. Submit your contributions to participate.
            </Typography>
            <Input 
              placeholder="Contribution"
              sx={{ mb: 2 }}
            />
            <Textarea
              placeholder="Contribution description"
              minRows={3}
              sx={{ mb: 2 }}
            />
            <Typography level="body1" sx={{ mt: 2, mb: 1 }}>
              Proof links
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Input placeholder="Proof" size="sm" />
              <Input placeholder="Link" size="sm" />
              <Button variant="outlined" size="sm">+</Button>
            </Box>
            <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
              Add contribution
            </Button>
            <Divider sx={{ my: 3 }} />
            <Typography level="body1" gutterBottom>
              Some reminder here.
            </Typography>
            <Button variant="solid" fullWidth>
              Submit contributions
            </Button>
          </Card>

          {/* Previous Elections */}
          <Typography level="h3" sx={{ mt: 4, mb: 2 }}>Previous Elections</Typography>
          {previousElections.map((election, index) => (
            <PreviousElectionCard
              key={index}
              electionNumber={election.number}
              startDate={election.startDate}
              endDate={election.endDate}
              rooms={election.rooms}
            />
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export default GamePage;