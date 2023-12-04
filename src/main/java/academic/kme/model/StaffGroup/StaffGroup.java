package academic.kme.model.StaffGroup;


import academic.kme.model.Document.Document;
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
public class StaffGroup {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne
    private Document document;

    @OneToMany(mappedBy = "staffGroup", fetch = FetchType.EAGER, cascade = CascadeType.PERSIST, orphanRemoval = true)
    @OrderColumn
    private List<Staff> staves;

    @Embedded
    private GraphicHints hints;
}
