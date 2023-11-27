package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.*;

import java.util.List;

public interface Artist {
    void clear();
    void drawStaffLines(StaffLines staffLines);
    void drawClef(Clef clef);
    void drawTimeSignature(TimeSignature timeSignature);
    void drawAccidental(Accidental accidental);
    void drawNoteStems(List<NoteStem> noteStems);
}
