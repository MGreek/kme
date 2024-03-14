package com.example.kmebackend.service

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import com.example.kmebackend.model.VoiceId
import com.example.kmebackend.repository.GroupingRepository
import com.example.kmebackend.repository.VoiceRepository
import org.springframework.stereotype.Service

@Service
data class GroupingService(
    val groupingRepository: GroupingRepository,
    val voiceRepository: VoiceRepository,
) {
    /**
     * A wrapper around GroupingRepository::save
     */
    fun save(grouping: Grouping): Grouping {
        return groupingRepository.save(grouping)
    }

    /**
     * Creates a new Grouping and appends it to the list corresponding to voiceId.
     * @param voiceId must correspond to a saved Voice.
     * @param grouping the instance from where data is copied to the new Grouping. Its ID is ignored.
     * @return a new Grouping that is appended to the list corresponding to voiceId.
     */
    fun appendToVoice(
        voiceId: VoiceId,
        grouping: Grouping,
    ): Grouping {
        if (!voiceRepository.existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        val newGrouping =
            grouping.copy(
                groupingId =
                    GroupingId(
                        voiceId,
                        voiceRepository.countChildren(voiceId),
                    ),
                voice = voiceRepository.findById(voiceId).get(),
            )
        return newGrouping
    }
}
