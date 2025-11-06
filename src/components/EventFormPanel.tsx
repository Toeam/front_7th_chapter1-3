import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Button,
  Typography,
} from '@mui/material';

import { RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type NotificationOption = { value: number; label: string };

interface EventFormPanelProps {
  title: string;
  setTitle: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  isRepeating: boolean;
  setIsRepeating: (v: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (v: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (v: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (v: string) => void;
  notificationTime: number;
  setNotificationTime: (v: number) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  editingEvent: unknown | null;
  categories: string[];
  notificationOptions: NotificationOption[];
}

const EventFormPanel = ({
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
  isRepeating,
  setIsRepeating,
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  repeatEndDate,
  setRepeatEndDate,
  notificationTime,
  setNotificationTime,
  startTimeError,
  endTimeError,
  handleStartTimeChange,
  handleEndTimeChange,
  onSubmit,
  editingEvent,
  categories,
  notificationOptions,
}: EventFormPanelProps) => {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <TextField
            id="start-time"
            size="small"
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            onBlur={() => getTimeErrorMessage(startTime, endTime)}
            error={!!startTimeError}
            helperText={startTimeError || ''}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <TextField
            id="end-time"
            size="small"
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            onBlur={() => getTimeErrorMessage(startTime, endTime)}
            error={!!endTimeError}
            helperText={endTimeError || ''}
          />
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!editingEvent && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeating}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsRepeating(checked);
                  setRepeatType(checked ? 'daily' : 'none');
                }}
              />
            }
            label="반복 일정"
          />
        </FormControl>
      )}

      {isRepeating && !editingEvent && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 유형</FormLabel>
            <Select
              size="small"
              value={repeatType}
              aria-label="반복 유형"
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <MenuItem value="daily" aria-label="daily-option">
                매일
              </MenuItem>
              <MenuItem value="weekly" aria-label="weekly-option">
                매주
              </MenuItem>
              <MenuItem value="monthly" aria-label="monthly-option">
                매월
              </MenuItem>
              <MenuItem value="yearly" aria-label="yearly-option">
                매년
              </MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
              <TextField
                id="repeat-interval"
                size="small"
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
              <TextField
                id="repeat-end-date"
                size="small"
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </Stack>
        </Stack>
      )}

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};

export default EventFormPanel;
