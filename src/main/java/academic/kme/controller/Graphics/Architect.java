package academic.kme.controller.Graphics;

import academic.kme.model.Document.Document;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Architect {
    private Document document;
    private Artist artist;

    public void draw() {
        artist.clear();

    }

    private void drawStaffLines() {

    }
}