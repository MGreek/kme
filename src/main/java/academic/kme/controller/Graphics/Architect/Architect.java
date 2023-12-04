package academic.kme.controller.Graphics.Architect;

import academic.kme.controller.Graphics.Artist.Artist;
import academic.kme.controller.Graphics.Primitive.BracketType;
import academic.kme.controller.Graphics.Primitive.StaffLines;
import academic.kme.controller.Graphics.Primitive.StaffLinesGroup;
import academic.kme.model.Document.Document;
import academic.kme.model.Staff.Staff;
import academic.kme.model.StaffGroup.StaffGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Architect {
    private Document document;
    private Artist artist;

    public void draw() {
        artist.clear();
        drawStaffLines();
    }

    public static StaffLinesGroup createStaffLinesGroup(double x, double y, StaffGroup staffGroup, Document document) {
        var staffLinesGroup = new StaffLinesGroup();
        staffLinesGroup.setX(x);
        staffLinesGroup.setY(y);
        staffLinesGroup.setBracketType(BracketType.Curly);
        staffLinesGroup.setOffset(10);
        staffLinesGroup.setLineHeight(document.getHints().getLineHeight());
        staffLinesGroup.setSpaceHeight(document.getHints().getSpaceHeight());
        staffLinesGroup.setStaffLines(new ArrayList<>());
        for (Staff staff : staffGroup.getStaves()) {
            StaffLines staffLines = new StaffLines();
            staffLinesGroup.getStaffLines().add(staffLines);
        }
        return staffLinesGroup;
    }

    private void drawStaffLines() {
        var staffGroup = document.getStaffGroups().stream().findFirst();
        staffGroup.ifPresent(group -> artist.drawStaffLinesGroup(createStaffLinesGroup(10, 10, group, document)));
    }
}