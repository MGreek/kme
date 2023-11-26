package academic.kme.model.NoteCluster;

import jakarta.persistence.AttributeConverter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.List;

public class NoteHeadListConverter implements AttributeConverter<List<NoteHead>, byte[]> {
    @Override
    public byte[] convertToDatabaseColumn(List<NoteHead> noteHeads) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ObjectOutputStream out = new ObjectOutputStream(bos)) {
            out.writeObject(noteHeads);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<NoteHead> convertToEntityAttribute(byte[] bytes) {
        return null;
    }
}
