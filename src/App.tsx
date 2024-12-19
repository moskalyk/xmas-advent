// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Gift } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Container,
  Box
} from '@mui/material';

// Types
interface CalendarData {
  channel: string;
  title: string;
  // startDate: string;
  backgroundImage: string;
}

interface Position {
  x: number;
  y: number;
}

interface DoorProps {
  day: number;
  position: Position;
  content: string;
  isOpen: boolean;
  onOpen: () => void;
}

const STORAGE_KEY = 'advent-opened-doors';

// Snow Component
const Snow: React.FC = () => {
  return (
    <Box 
      sx={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            color: 'white',
            animation: 'fall linear infinite',
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            opacity: Math.random(),
            fontSize: `${Math.random() * 10 + 10}px`
          }}
        >
          *
        </Box>
      ))}
    </Box>
  );
};

// Creation Form Component
const CreateAdventCalendar: React.FC = () => {
  const [channel, setChannel] = useState('');
  const [title, setTitle] = useState('');
  // const [startDate, setStartDate] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  const handleCreate = () => {
    const params = new URLSearchParams({
      channel,
      title: encodeURIComponent(title),
      // startDate,
      bg: encodeURIComponent(backgroundImage)
    });
    window.location.search = params.toString();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader 
          title="Create Your Advent Calendar"
          subheader="Set up your custom advent calendar from an are.na channel"
        />
        <CardContent>
          <Box component="form" sx={{ '& > :not(style)': { mb: 2 } }}>
            <TextField
              fullWidth
              label="Arena Channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Enter Arena channel slug"
            />
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Calendar title"
            />
            {/*<TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />*/}
            <TextField
              fullWidth
              label="Background Image URL"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button 
              fullWidth
              variant="contained"
              onClick={handleCreate}
              disabled={!channel || !title 
                // || !startDate
              }
            >
              Create Calendar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

const AdventDoor: React.FC<DoorProps> = ({ day, position, content, isOpen, onOpen }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '180px',
        height: '180px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={onOpen}
    >
      <Card 
        sx={{ 
          height: '100%',
          transform: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          overflow: 'hidden', // Ensure nothing breaks out of the card
          '& > div': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '82%',
            height: '82%'
          }
        }}
      >
        {!isOpen ? (
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            <Gift style={{ width: 32, height: 32, marginBottom: 8 }} />
            <Typography variant="h2" style={{fontFamily: 'Gothic'}}>{day}</Typography>
          </CardContent>
        ) : (
          <CardContent 
            sx={{ 
              height: '100%',
              p: '16px !important',
              overflow: 'hidden', // Container overflow hidden
              '& .content': {
                height: '100%',
                overflowY: 'auto', // Enable vertical scrolling
                overflowX: 'hidden', // Prevent horizontal scrolling
                '& img': {
                  maxWidth: '100%', // Ensure images don't overflow
                  height: 'auto',
                },
                '& *': {
                  maxWidth: '100%', // Ensure all elements respect container width
                  wordWrap: 'break-word', // Break long words
                },
              }
            }}
          >
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: content || 'Loading...' }}
            />

          </CardContent>
        )}
      </Card>
    </Box>
  );
};

// Helper functions
const doRectanglesOverlap = (rect1: Position, rect2: Position) => {
  const doorSize = { width: 150, height: 150 };
  const padding = 50;
  return Math.abs(rect1.x - rect2.x) < (doorSize.width + padding) &&
         Math.abs(rect1.y - rect2.y) < (doorSize.height + padding);
};

const generateNonOverlappingPositions = (count: number, containerWidth: number, containerHeight: number) => {
  const positions: Position[] = [];
  const doorSize = { width: 150, height: 150 };
  const padding = 20;
  const maxAttempts = 100;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let valid = false;

    while (!valid && attempts < maxAttempts) {
      const newPosition = {
        x: (Math.random() * (containerWidth - doorSize.width - padding * 2) + padding),
        y: (Math.random() * (containerHeight - doorSize.height - padding * 2) + padding)
      };

      valid = !positions.some(pos => doRectanglesOverlap(pos, newPosition));
      
      if (valid) {
        positions.push(newPosition);
        break;
      }
      attempts++;
    }

    if (!valid) {
      const gridCols = Math.ceil(Math.sqrt(count));
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      positions.push({
        x: (col * (doorSize.width + padding)) % containerWidth,
        y: row * (doorSize.height + padding)
      });
    }
  }

  return positions;
};

// Calendar Component
const AdventCalendar: React.FC = () => {
  const [doors, setDoors] = useState<Position[]>([]);
  const [openDoors, setOpenDoors] = useState<Record<number, string>>({});
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [showNewButton, setShowNewButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedOpenDoors = localStorage.getItem(STORAGE_KEY);
    if (savedOpenDoors) {
      setOpenDoors(JSON.parse(savedOpenDoors));
    }

    const params = new URLSearchParams(window.location.search);
    const data = {
      channel: params.get('channel') || '',
      title: decodeURIComponent(params.get('title') || ''),
      // startDate: params.get('startDate') || '',
      backgroundImage: decodeURIComponent(params.get('bg') || '')
    };
    setCalendarData(data);

    setTimeout(async () => {

let allContents: any[] = [];
    let page = 1;
    let keepFetching = true;

    // Keep fetching until we have at least 24 items or run out of pages
    while (keepFetching) {
      try {
        const res = await fetch(`https://api.are.na/v2/channels/${data.channel}/contents?page=${page}`);
        if (!res.ok) break;

        const pageData = await res.json();
        allContents = [...allContents, ...pageData.contents];

        // Stop if we have enough items or there are no more pages
        if (allContents.length >= 24 || !pageData.contents.length) {
          keepFetching = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
        break;
      }
    }

    // Store the contents for later use
    // setChannelContents(allContents.slice(0, 24));

    const positions = generateNonOverlappingPositions(
      allContents.slice(0, 24).length,

      containerRef!.current!.offsetWidth!,
      2000
    );
    setDoors(positions);
    }, 0)

  }, []);

  const handleOpenDoor = async (day: number) => {
    // console.log()
    if (openDoors[day] || !calendarData) return;

    try {
      let allContents: any[] = [];
    let page = 1;
    let keepFetching = true;

    // Keep fetching until we have at least 24 items or run out of pages
    while (keepFetching) {
      try {
        const res = await fetch(`https://api.are.na/v2/channels/${calendarData.channel}/contents?page=${page}`);
        if (!res.ok) break;

        const pageData = await res.json();
        allContents = [...allContents, ...pageData.contents];

        // Stop if we have enough items or there are no more pages
        if (allContents.length >= 24 || !pageData.contents.length) {
          keepFetching = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
        break;
      }
    }

        const content = allContents[day-1];
        const html = content.content_html || 'No content available';
        const newOpenDoors = { ...openDoors, [day]: html };
        setOpenDoors(newOpenDoors);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOpenDoors));
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  if (!calendarData) return null;

  return (
    <Box 

      ref={containerRef!}
      sx={{
        position: 'relative',
        width: '100%',
        height: '2000px',
        overflowY: 'auto',
        backgroundImage: calendarData.backgroundImage ? `url(${calendarData.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Snow />
      <Box 
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10
        }}
        onMouseEnter={() => setShowNewButton(true)}
        onMouseLeave={() => setShowNewButton(false)}
      >
        <Typography variant="h4" sx={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          {calendarData.title}
        </Typography>
        <Button 
          variant="contained"
          sx={{
            mt: 1,
            opacity: showNewButton ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
          onClick={() => window.location.search = ''}
        >
          Create New Calendar
        </Button>
      </Box>
      {doors.map((position, index) => (
        <AdventDoor
        
          key={index}
          day={index + 1}
          position={position}
          content={openDoors[index + 1] || ''}
          isOpen={!!openDoors[index + 1]}
          onOpen={() => handleOpenDoor(index + 1)}
        />
      ))}
    </Box>
  );
};

// Main App Component
export default function App() {
  const isCalendarView = window.location.search.includes('channel');
  return isCalendarView ? <AdventCalendar /> : <CreateAdventCalendar />;
}