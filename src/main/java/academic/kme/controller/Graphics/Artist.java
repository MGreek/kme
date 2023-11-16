package academic.kme.controller.Graphics;

import academic.kme.model.Note.Note;

import java.util.List;

public interface Artist {
    void DrawLines(int offset);
    void DrawNote(Note note, double x);
    void DrawNotes(List<Note> notes, List<Double> xs);
}
