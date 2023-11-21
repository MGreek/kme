package academic.kme.controller.Graphics;

import java.util.List;

public interface Artist {
    void DrawStaffLines(double x, double y, double lineHeight, double spaceHeight, double length);
    void DrawTrebleClef(int staffIndex, int lineOffset, double position);
    void DrawAltoClef(int staffIndex, int lineOffset, double position);
    void DrawBassClef(int staffIndex, int lineOffset, double position);
    void DrawTimeSignature(int count, int length, double position);
    void DrawAccidental(int staffIndex, int lineOffset, int accidental, double position);
    void DrawNoteCluster(int staffIndex, List<Integer> lines, byte length, boolean upsideDown, double position);
    void DrawConnectedNoteClusters(int[] staffIndex, List<Integer>[] lines, byte[] length, boolean upsideDown, double[] position);

}
