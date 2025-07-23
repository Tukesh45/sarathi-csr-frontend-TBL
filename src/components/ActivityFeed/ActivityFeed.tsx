import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
} from '@mui/material';
import { 
  Update as UpdateIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Add as AddIcon 
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'update' | 'upload' | 'edit' | 'create';
  user: string;
  action: string;
  timestamp: string;
  entity: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  userRole: 'admin' | 'client' | 'ngo';
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, userRole }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <UpdateIcon />;
      case 'upload':
        return <UploadIcon />;
      case 'edit':
        return <EditIcon />;
      case 'create':
        return <AddIcon />;
      default:
        return <UpdateIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'update':
        return 'primary';
      case 'upload':
        return 'success';
      case 'edit':
        return 'warning';
      case 'create':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Live Activity Feed
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.main` }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" component="span">
                      {activity.user}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                      {activity.action}
                    </Typography>
                    <Chip 
                      label={activity.entity} 
                      size="small" 
                      color={getActivityColor(activity.type) as any}
                    />
                  </Box>
                }
                secondary={activity.timestamp}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed; 