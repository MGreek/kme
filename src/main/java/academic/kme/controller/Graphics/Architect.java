package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.Group;
import academic.kme.controller.Graphics.Primitive.NoteHead;
import academic.kme.controller.Graphics.Primitive.StaffLines;
import academic.kme.model.Document.Document;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Architect {
    private Document document;
    private Artist artist;

    void Draw() {
        artist.clear();
        artist.drawStaffLines(new StaffLines(10, 10, 1.0, 2.0, 100));
        artist.drawGroup(new Group(List.of(new NoteHead(20, 10 + (1.0 / 2), 5, false,
                1, null))));
    }
}