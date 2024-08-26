import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Box, 
  Typography, 
  Avatar,
  Card,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/joy';

const GameHistory = ({ games }) => {
  return (
    <>
      <Typography level="h5" sx={{ mt: 4, mb: 2 }}>Game History</Typography>
      {games.map((game, index) => (
        <Accordion key={index}>
          <AccordionSummary>
            <Typography level="h6">Election #{game.number}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography level="body2" sx={{ mb: 1 }}>
              {game.startDate} - {game.endDate}
            </Typography>
            <Typography level="body2" sx={{ mb: 1 }}>
              Room {game.room.number}
            </Typography>
            {game.room.participants.map((participant, pIndex) => (
              <Box key={pIndex} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar src={participant.avatar} alt={participant.name} size="sm" />
                  <Typography level="body2" sx={{ ml: 1 }}>
                    {participant.name} - {participant.votes} votes
                  </Typography>
                </Box>
                {participant.contributions.map((contribution, cIndex) => (
                  <Card key={cIndex} variant="outlined" sx={{ mt: 1, p: 2 }}>
                    <Typography level="body1">{contribution.title}</Typography>
                    <Typography level="body2">{contribution.description}</Typography>
                  </Card>
                ))}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

function MakeDao() {
  const { user } = usePrivy();

  const [profileData] = useState({
    name: "Alice",
    avatar: "./placeholderimage.jpg",
    description: "Passionate developer and community contributor",
    gamesParticipated: 3,
    totalRespect: 21,
    averageRespect: 7,
    gameHistory: [
      {
        number: 1,
        startDate: '10 Aug, 7pm UTC',
        endDate: '12 Aug, 7pm UTC',
        room: {
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
                },
                {
                  title: 'Documentation Update',
                  description: 'Updated the project README and contributing guidelines',
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
                }
              ]
            }
          ]
        }
      },
      {
        number: 2,
        startDate: '15 Aug, 7pm UTC',
        endDate: '17 Aug, 7pm UTC',
        room: {
          number: 2,
          participants: [
            {
              name: 'Alice',
              avatar: './placeholderimage.jpg',
              votes: 8,
              contributions: [
                {
                  title: 'Feature Implementation',
                  description: 'Implemented user profile customization',
                },
                {
                  title: 'Performance Optimization',
                  description: 'Optimized database queries, improving response time by 30%',
                }
              ]
            },
            {
              name: 'Charlie',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'UI Design',
                  description: 'Redesigned the dashboard for better user experience',
                }
              ]
            }
          ]
        }
      },
      {
        number: 3,
        startDate: '20 Aug, 7pm UTC',
        endDate: '22 Aug, 7pm UTC',
        room: {
          number: 1,
          participants: [
            {
              name: 'Alice',
              avatar: './placeholderimage.jpg',
              votes: 6,
              contributions: [
                {
                  title: 'API Integration',
                  description: 'Integrated a third-party payment gateway',
                }
              ]
            },
            {
              name: 'David',
              avatar: './placeholderimage.jpg',
              votes: 8,
              contributions: [
                {
                  title: 'Security Audit',
                  description: 'Conducted a comprehensive security audit and patched vulnerabilities',
                },
                {
                  title: 'Code Refactoring',
                  description: 'Refactored the authentication module for better maintainability',
                }
              ]
            },
            {
              name: 'Eva',
              avatar: './placeholderimage.jpg',
              votes: 5,
              contributions: [
                {
                  title: 'User Testing',
                  description: 'Organized and conducted user testing sessions for the new features',
                }
              ]
            }
          ]
        }
      }
    ]
  });

  return (
<Box 
      className="makedao" 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        flexDirection: { xs: 'column', md: 'column' },
        position: 'relative',
        overflow: 'scroll',
        p: 3
      }}
    >
      <Card sx={{ p: 3, width: '50vw' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={3} md={2}>
            <Avatar
              src={profileData.avatar}
              alt={profileData.name}
              sx={{ width: 80, height: 80, mx: 'auto' }}
            />
          </Grid>
          <Grid xs={12} sm={9} md={10}>
            <Typography level="h4">{profileData.name}</Typography>
            <Typography level="body1" sx={{ mt: 1, mb: 2 }}>{profileData.description}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip variant="outlined">
                Participated in {profileData.gamesParticipated} elections
              </Chip>
              <Chip variant="outlined">
                Total Respect: {profileData.totalRespect}
              </Chip>
              <Chip variant="outlined">
                Average Respect: {profileData.averageRespect}
              </Chip>
            </Box>
          </Grid>
        </Grid>
        <GameHistory games={profileData.gameHistory} />
      </Card>
    </Box>
  );
}

export default MakeDao;