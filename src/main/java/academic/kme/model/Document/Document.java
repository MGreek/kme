package academic.kme.model.Document;

import academic.kme.model.Staff.Staff;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    public static Document DefaultDocument;

    @Id
    private UUID id = UUID.randomUUID();

    @Embedded
    private GraphicHints hints;

    @OneToMany(mappedBy = "document", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Staff> staves;
}
