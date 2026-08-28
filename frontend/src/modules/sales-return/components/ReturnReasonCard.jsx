import { Paper, Stack, Typography, TextField, MenuItem, Box } from '@mui/material';

const MAX_NOTE_LENGTH = 250;

export default function ReturnReasonCard({ reason, onReasonChange, note, onNoteChange, reasons }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          label={
            <>
              Return Reason <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </>
          }
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          fullWidth
        >
          {reasons.map((r) => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </TextField>

        <Box>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Enter return note…"
            value={note}
            onChange={(e) => onNoteChange(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 0.5 }}>
            {note.length} / {MAX_NOTE_LENGTH}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
