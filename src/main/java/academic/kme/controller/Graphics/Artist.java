package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.Note;
import academic.kme.controller.Graphics.Primitive.StaffLines;

import java.util.List;

public interface Artist {
    void drawStaffLines(StaffLines staffLines);
    void drawTrebleClef(int staffIndex, int lineOffset, double position);
    void drawAltoClef(int staffIndex, int lineOffset, double position);
    void drawBassClef(int staffIndex, int lineOffset, double position);
    void drawTimeSignature(int count, int length, double position);
    void drawAccidental(int staffIndex, int lineOffset, int accidental, double position);
    void drawNote(Note note);
    void drawNotes(List<Note> notes);
}
